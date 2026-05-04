import {promises as fs} from 'fs';
import matter from 'gray-matter';
import {remark} from 'remark';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import {visit} from 'unist-util-visit';
import type {Node, Parent} from 'unist';
import type {
  Blockquote,
  Content,
  Image,
  Link,
  Paragraph,
  PhrasingContent,
  Strong,
  Text,
} from 'mdast';
import {page_routes as pageRoutes} from '@/lib/routes-config';
import {getBaseUrl, getDocsContentPath} from '@/lib/docs-utils';

const DOC_ROUTE_LOOKUP = (() => {
  const map = new Map<string, string>();
  for (const route of pageRoutes) {
    if (!route.href) continue;
    const clean = route.href.replace(/^\/+/, '');
    const slug = clean.replace(/^docs\//, '');
    map.set(slug, slug);
    map.set(clean, slug);
    map.set(`docs/${slug}`, slug);
  }
  return map;
})();

export async function convertMdxToMarkdown(rawMdx: string, slug: string) {
  const {content, data} = matter(rawMdx);

  const file = await remark()
    .use(remarkMdx)
    .use(remarkGfm)
    .use(mdxToMarkdownPlugin)
    .use(resolveResourcesPlugin, {slug})
    .use(normalizeLineBreaks)
    .process(content);

  let markdown = file.toString().trim();

  // prepend frontmatter as title and description
  if (data.title) {
    markdown = `# ${data.title}\n\n${markdown}`;
  }
  if (data.description) {
    markdown = `${data.description}\n\n${markdown}`;
  }

  // unescape backslashes added before certain special chars for readability
  markdown = markdown.replace(/\\([`*])/g, '$1');

  return markdown;
}

export async function getMarkdownForSlug(slug: string) {
  try {
    const contentPath = await getDocsContentPath(slug);
    const rawMdx = await fs.readFile(contentPath, 'utf-8');
    return await convertMdxToMarkdown(rawMdx, slug);
  } catch (err) {
    console.error(`Error creating markdown for slug "${slug}":`, err);
    return null;
  }
}

function normalizeLineBreaks() {
  return (tree: Node) => {
    visit(tree, 'text', node => {
      const textNode = node as Text;
      if (!textNode.value) return;

      textNode.value = textNode.value.replace(/([^\n])\n([^\n])/g, '$1 $2');
      textNode.value = textNode.value.replace(/\n+$/, '').replace(/^\n+/, '');
    });

    visit(tree, 'paragraph', node => {
      const paragraph = node as Paragraph;
      const children = paragraph.children;
      if (!children || children.length < 2) return;

      for (let index = 0; index < children.length - 1; index++) {
        const current = children[index];
        if (current?.type === 'text') {
          const textNode = current as Text;
          if (textNode.value && !/[\s([{]$/.test(textNode.value.trimEnd())) {
            textNode.value = textNode.value.trimEnd() + ' ';
          }
        }
      }
    });
  };
}

function resolveResourcesPlugin(options?: {slug: string}) {
  const slug = options?.slug ?? '';

  return (tree: Node) => {
    visit(tree, 'image', node => {
      const image = node as Image;
      image.url = resolveAssetUrl(image.url);
    });

    visit(tree, 'link', node => {
      const link = node as Link;
      link.url = resolveDocumentHref(link.url, slug);
    });
  };
}

function mdxToMarkdownPlugin() {
  return (tree: Node) => {
    const root = tree as Parent;
    root.children = normalizeNodes(root.children as Node[]);
  };
}

function normalizeNodes(nodes: Node[]) {
  return nodes.flatMap(node => normalizeNode(node));
}

function normalizeNode(node: Node): Node[] {
  if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
    const outcome = transformMdxJsx(node as MdxJsxNode);
    if (!outcome) return [];

    switch (outcome.action) {
      case 'replace':
        return [outcome.node];

      case 'remove':
        return [];

      case 'unwrap':
        return outcome.children;

      default:
        return [];
    }
  }

  if (hasChildren(node)) {
    return [cloneWithChildren(node, normalizeNodes(node.children as Node[]))];
  }

  return [node];
}

function hasChildren(node: Node): node is Parent {
  return 'children' in node && Array.isArray((node as Parent).children);
}

function cloneWithChildren<T extends Node>(node: T, children: Node[]): T {
  return {...node, children} as T;
}

function transformMdxJsx(node: MdxJsxNode): TransformOutcome | null {
  if (!node.name) {
    return {
      action: 'unwrap',
      children: normalizeNodes([...(node.children ?? [])]),
    };
  }

  switch (node.name) {
    case 'Note':
      return {action: 'replace', node: transformNote(node)};

    case 'CodeGroup':
      return {action: 'unwrap', children: transformCodeGroup(node)};

    case 'SyncedCode':
      return {action: 'unwrap', children: transformSyncedCode(node)};

    case 'InstallTableNameReplace':
    case 'InstallTableNameInput':
      return {
        action: 'unwrap',
        children: normalizeNodes([...(node.children ?? [])]),
      };

    case 'ImageLightbox':
    case 'img': {
      const paragraph = transformImage(node);
      return paragraph
        ? {action: 'replace', node: paragraph}
        : {action: 'remove'};
    }

    case 'Video':
      return {action: 'replace', node: transformVideo(node)};

    default:
      return {action: 'remove'};
  }
}

function transformNote(node: MdxJsxNode): Blockquote {
  const emoji = getAttribute(node.attributes, 'emoji');
  const heading = getAttribute(node.attributes, 'heading');
  const blockChildren = normalizeNodes([
    ...(node.children ?? []),
  ]) as Blockquote['children'];

  const prefix: PhrasingContent[] = [];
  if (emoji) prefix.push({type: 'text', value: `${emoji} `});
  if (heading) prefix.push({type: 'text', value: `**${heading}**: `});

  if (prefix.length > 0) {
    const first = blockChildren[0];

    if (first && first.type === 'paragraph') {
      const paragraph = first as Paragraph;
      const phrasing = paragraph.children ?? [];

      paragraph.children = [...prefix, ...phrasing];
    } else {
      blockChildren.unshift({type: 'paragraph', children: prefix});
    }
  }

  return {type: 'blockquote', children: blockChildren};
}

function transformCodeGroup(node: MdxJsxNode): Node[] {
  const labels = getCodeGroupLabels(node.attributes);
  const variants = node.children ?? [];

  return variants.flatMap((variant, index) => {
    const label = labels[index] ?? `Option ${index + 1}`;
    return [createLabelParagraph(label), ...normalizeNode(variant)];
  });
}

function transformSyncedCode(node: MdxJsxNode): Node[] {
  const syncValues = getStringArrayAttribute(node.attributes, 'syncValues');
  const variants = node.children ?? [];

  return variants.flatMap((variant, index) => {
    const label = syncValues[index] ?? `Variant ${index + 1}`;
    return [createLabelParagraph(label), ...normalizeNode(variant)];
  });
}

function createLabelParagraph(label: string): Paragraph {
  const strong: Strong = {
    type: 'strong',
    children: [{type: 'text', value: label}],
  };

  return {
    type: 'paragraph',
    children: [strong],
  };
}

function transformImage(node: MdxJsxNode): Paragraph | null {
  const src = getAttribute(node.attributes, 'src');

  if (!src) return null;

  const caption = getAttribute(node.attributes, 'caption');
  const altFromAttr = getAttribute(node.attributes, 'alt');
  const titleAttr =
    node.name === 'img' ? getAttribute(node.attributes, 'title') : undefined;
  const alt = caption ?? altFromAttr ?? '';
  const image: Image = {
    type: 'image',
    url: resolveAssetUrl(src),
    alt,
    title: titleAttr ?? null,
  };

  return {type: 'paragraph', children: [image]};
}

function transformVideo(node: MdxJsxNode): Paragraph {
  const src = getAttribute(node.attributes, 'src') ?? '';
  const alt = getAttribute(node.attributes, 'alt') || 'video';

  const linkText: Text = {type: 'text', value: alt};
  const link: Link = {
    type: 'link',
    url: src,
    title: null,
    children: [linkText],
  };

  return {type: 'paragraph', children: [link]};
}

function getAttribute(attributes: MdxJsxNode['attributes'], name: string) {
  const attr = attributes?.find(
    a => a.type === 'mdxJsxAttribute' && a.name === name,
  );
  if (!attr || attr.type !== 'mdxJsxAttribute') return undefined;

  if (typeof attr.value === 'string') return attr.value;
  if (attr.value && typeof attr.value === 'object' && 'value' in attr.value) {
    return String(attr.value.value).trim();
  }
}

function getStringArrayAttribute(
  attributes: MdxJsxNode['attributes'],
  name: string,
) {
  const value = getExpressionAttributeValue(attributes, name);
  if (!Array.isArray(value)) return [];

  return value.flatMap(item =>
    typeof item === 'string' && item.trim() ? [item.trim()] : [],
  );
}

function getCodeGroupLabels(attributes: MdxJsxNode['attributes']) {
  const value = getExpressionAttributeValue(attributes, 'labels');
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    if (typeof item === 'string' && item.trim()) {
      return item.trim();
    }

    if (item && typeof item === 'object' && 'text' in item) {
      const text = item.text;
      if (typeof text === 'string' && text.trim()) {
        return text.trim();
      }
    }

    return `Option ${index + 1}`;
  });
}

function getExpressionAttributeValue(
  attributes: MdxJsxNode['attributes'],
  name: string,
) {
  const attr = attributes?.find(
    attribute =>
      attribute.type === 'mdxJsxAttribute' && attribute.name === name,
  );
  if (!attr || attr.type !== 'mdxJsxAttribute') return undefined;

  return evaluateExpressionAttributeValue(attr.value);
}

function evaluateExpressionAttributeValue(value: MdxJsxAttributeValue) {
  if (!value || typeof value === 'string') return undefined;

  const statement = value.data?.estree?.body?.[0];
  if (!statement || statement.type !== 'ExpressionStatement') {
    return undefined;
  }

  return evaluateEstreeExpression(statement.expression);
}

function evaluateEstreeExpression(
  node: EstreeNode | null | undefined,
): unknown {
  if (!node) return undefined;

  switch (node.type) {
    case 'Literal':
      return node.value;

    case 'ArrayExpression':
      return node.elements.map(element => evaluateEstreeExpression(element));

    case 'ObjectExpression':
      return node.properties.reduce<Record<string, unknown>>(
        (result, property) => {
          if (property.type !== 'Property' || property.computed) {
            return result;
          }

          const key = getEstreeObjectKey(property.key);
          if (!key) return result;

          result[key] = evaluateEstreeExpression(property.value);
          return result;
        },
        {},
      );

    case 'UnaryExpression': {
      const evaluated = evaluateEstreeExpression(node.argument);
      if (typeof evaluated !== 'number') return undefined;
      return node.operator === '-' ? -evaluated : evaluated;
    }

    default:
      return undefined;
  }
}

function getEstreeObjectKey(node: EstreeNode | null | undefined) {
  if (!node) return undefined;

  if (node.type === 'Identifier') {
    return node.name;
  }

  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
}

function resolveAssetUrl(src: string) {
  if (!src || /^https?:\/\//i.test(src) || src.startsWith('//')) {
    return src;
  }

  const baseUrl = getBaseUrl();
  const normalizedBase = baseUrl.replace(/\/?$/, '');
  const normalizedPath = src.startsWith('/') ? src.slice(1) : src;

  return `${normalizedBase}/${normalizedPath}`;
}

function resolveRelativeSlug(currentSlug: string, relativePath: string) {
  const baseSegments = currentSlug.split('/').filter(Boolean);
  if (baseSegments.length > 0) baseSegments.pop();

  let remaining = relativePath;
  while (remaining.startsWith('./')) {
    remaining = remaining.slice(2);
  }

  const segments = remaining.split('/');
  const stack = [...baseSegments];

  for (const segment of segments) {
    if (!segment || segment === '.') continue;

    if (segment === '..') {
      if (stack.length > 0) stack.pop();

      continue;
    }

    stack.push(segment);
  }

  return stack.join('/');
}

function resolveDocumentHref(href: string, currentSlug: string) {
  if (!href) return href;

  const trimmed = href.trim();
  if (!trimmed) return trimmed;

  if (
    trimmed.startsWith('#') ||
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ||
    trimmed.startsWith('//')
  ) {
    return trimmed;
  }

  const [pathPartRaw, hashPart] = trimmed.split('#', 2);
  const pathPart = pathPartRaw ?? '';

  let docSlug: string | undefined;
  let absolutePath: string | undefined;

  if (!pathPart || pathPart === '.' || pathPart === './') {
    docSlug = currentSlug;
  } else if (pathPart.startsWith('/')) {
    absolutePath = pathPart;
  } else if (pathPart.startsWith('docs/')) {
    docSlug = pathPart.replace(/^\/+/, '').replace(/^docs\//, '');
  } else {
    const normalized = pathPart.replace(/^\/+/, '');
    const routeSlug = DOC_ROUTE_LOOKUP.get(normalized);
    if (routeSlug) {
      docSlug = routeSlug;
    } else if (pathPart.startsWith('./') || pathPart.startsWith('../')) {
      docSlug = resolveRelativeSlug(currentSlug, pathPart);
    } else {
      docSlug = resolveRelativeSlug(currentSlug, `./${pathPart}`);
    }
  }

  if (docSlug !== undefined) {
    const canonicalSlug = DOC_ROUTE_LOOKUP.get(docSlug) ?? docSlug;
    const clean = canonicalSlug.replace(/^\/+/, '');
    absolutePath = clean ? `/docs/${clean}` : '/docs';
  }

  if (!absolutePath) {
    const absoluteFallback = resolveAssetUrl(pathPart);
    return hashPart ? `${absoluteFallback}#${hashPart}` : absoluteFallback;
  }

  const absolute = resolveAssetUrl(absolutePath);
  return hashPart ? `${absolute}#${hashPart}` : absolute;
}

type TransformOutcome =
  | {action: 'replace'; node: Content}
  | {action: 'remove'}
  | {action: 'unwrap'; children: Node[]};

type MdxJsxAttributeValue =
  | string
  | null
  | undefined
  | {
      type: 'mdxJsxAttributeValueExpression';
      value: string;
      data?: {estree?: EstreeProgram};
    };

type MdxJsxAttribute =
  | {
      type: 'mdxJsxAttribute';
      name: string;
      value?: MdxJsxAttributeValue;
    }
  | {
      type: 'mdxJsxExpressionAttribute';
      value: string;
    };

type MdxJsxNode = Node & {
  type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
  name?: string | null;
  attributes?: MdxJsxAttribute[];
  children?: Node[];
};

type EstreeProgram = {
  type: 'Program';
  body?: EstreeNode[];
};

type EstreeNode =
  | {
      type: 'ExpressionStatement';
      expression: EstreeNode;
    }
  | {
      type: 'Literal';
      value: unknown;
    }
  | {
      type: 'ArrayExpression';
      elements: Array<EstreeNode | null>;
    }
  | {
      type: 'ObjectExpression';
      properties: EstreeNode[];
    }
  | {
      type: 'Property';
      computed?: boolean;
      key: EstreeNode;
      value: EstreeNode;
    }
  | {
      type: 'Identifier';
      name: string;
    }
  | {
      type: 'UnaryExpression';
      operator: string;
      argument: EstreeNode;
    };
