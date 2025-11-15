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
        const next = children[index + 1];

        if (current?.type === 'text') {
          const textNode = current as Text;
          if (textNode.value && !/[\s([{]$/.test(textNode.value.trimEnd())) {
            textNode.value = textNode.value.trimEnd() + ' ';
          }
        } else if (
          (current?.type === 'link' || current?.type === 'image') &&
          next?.type === 'text'
        ) {
          // ensure links/images have proper spacing before following text
          // only add space if missing and next text starts with a letter (not punctuation)
          const nextTextNode = next as Text;
          if (
            nextTextNode.value &&
            !/^\s/.test(nextTextNode.value) &&
            /^[a-zA-Z]/.test(nextTextNode.value)
          ) {
            nextTextNode.value = ' ' + nextTextNode.value;
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
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) return;

      if (
        node.type !== 'mdxJsxFlowElement' &&
        node.type !== 'mdxJsxTextElement'
      ) {
        return;
      }

      const outcome = transformMdxJsx(node as MdxJsxNode);
      if (!outcome) return;

      const parentNode = parent as Parent;
      const siblings = parentNode.children as Node[];

      switch (outcome.action) {
        case 'replace':
          siblings[index] = outcome.node;
          return index;

        case 'remove':
          siblings.splice(index, 1);
          return index;

        case 'unwrap':
          siblings.splice(index, 1, ...outcome.children);
          return index;

        default:
          return;
      }
    });
  };
}

function transformMdxJsx(node: MdxJsxNode): TransformOutcome | null {
  if (!node.name) {
    return {
      action: 'unwrap',
      children: [...(node.children ?? [])],
    };
  }

  switch (node.name) {
    case 'Note':
      return {action: 'replace', node: transformNote(node)};

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
  const blockChildren = [...(node.children ?? [])] as Blockquote['children'];

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
    absolutePath = clean ? `/docs/${clean}.md` : '/docs';
  } else if (
    absolutePath &&
    absolutePath.startsWith('/docs/') &&
    !absolutePath.endsWith('.md')
  ) {
    absolutePath = `${absolutePath}.md`;
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
  | {type: 'mdxJsxAttributeValueExpression'; value: string};

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
