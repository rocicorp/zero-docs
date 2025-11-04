import path from 'path';
import {promises as fs} from 'fs';
import {compileMDX} from 'next-mdx-remote/rsc';
import {page_routes} from './routes-config';
import remarkGfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeCodeTitles from 'rehype-code-titles';
import rehypeAddCopyButton from '@/lib/rehype-add-copy-button';
import matter from 'gray-matter';
import {remark} from 'remark';
import remarkMdx from 'remark-mdx';
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

// Custom components for MDX
import Note from '@/components/note';
import ImageLightbox from '@/components/ui/ImageLightbox';
import Video from '@/components/ui/Video';
import {Button} from '@/components/ui/button';
import {sluggify} from './utils';

const components = {Note, ImageLightbox, Video, Button};

const DOC_ROUTE_LOOKUP = (() => {
  const map = new Map<string, string>();
  for (const route of page_routes) {
    if (!route.href) continue;
    const clean = stripLeadingSlash(route.href);
    const slug = clean.replace(/^docs\//, '');
    map.set(slug, slug);
    map.set(clean, slug);
    map.set(`docs/${slug}`, slug);
  }
  return map;
})();

// Define the structure of the frontmatter
type BaseMdxFrontmatter = {title: string; description: string};

// Parse MDX content with the given plugins
async function parseMdx<Frontmatter>(rawMdx: string) {
  return await compileMDX<Frontmatter>({
    source: rawMdx,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          rehypeCodeTitles, // Adds titles to code blocks
          rehypePrism, // Adds syntax highlighting
          rehypeSlug, // Adds slugs to headings
          [
            rehypeAutolinkHeadings, // Makes headings clickable
            {
              behavior: 'wrap', // Wrap the heading with a clickable anchor
              properties: {
                className: 'heading-link', // Add a class for styling
              },
            },
          ],
          rehypeAddCopyButton, // Adds "copy" buttons to code blocks
        ],
        remarkPlugins: [remarkGfm], // Enables GitHub-flavored markdown
      },
    },
    components,
  });
}

// Fetch and parse MDX content for a given slug
export async function getDocsForSlug(slug: string) {
  try {
    const contentPath = await getDocsContentPath(slug);
    const rawMdx = await fs.readFile(contentPath, 'utf-8');
    return await parseMdx<BaseMdxFrontmatter>(rawMdx);
  } catch (err) {
    console.error(`Error fetching docs for slug "${slug}":`, err);
    return null;
  }
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

// Generate a Table of Contents (TOC) from markdown headings
export async function getDocsTocs(slug: string) {
  let rawMdx: string;
  try {
    const contentPath = await getDocsContentPath(slug);
    rawMdx = await fs.readFile(contentPath, 'utf-8');

    const headingsRegex = /^(#{2,4})\s(.+)$/gm; // Matches headings ## to ####
    let match;
    const extractedHeadings = [];
    while ((match = headingsRegex.exec(rawMdx)) !== null) {
      const headingLevel = match[1].length;
      const headingText = match[2].trim();
      const slug = sluggify(headingText);
      extractedHeadings.push({
        level: headingLevel,
        text: headingText,
        href: `#${slug}`, // Create anchor links
      });
    }
    return extractedHeadings;
  } catch (err) {
    console.error(`Error fetching docs for slug "${slug}":`, err);
    return [];
  }
}

export function getPreviousNext(path: string): {
  prev: (typeof page_routes)[number] | null;
  next: (typeof page_routes)[number] | null;
} {
  const index = page_routes.findIndex(({href}) => href == `/${path}`);
  return {
    prev: page_routes[index - 1] ?? null,
    next: page_routes[index + 1] ?? null,
  };
}

// Get the file path for the docs based on the slug
async function getDocsContentPath(slug: string) {
  if (slug.endsWith('.mdx')) {
    return path.join(process.cwd(), '/contents/docs/', `${slug}`);
  }

  // If the file exists with .mdx extension, return that path
  const mdxPath = path.join(process.cwd(), '/contents/docs/', `${slug}.mdx`);
  try {
    await fs.stat(mdxPath);
    return mdxPath;
  } catch {
    return path.join(process.cwd(), '/contents/docs/', `${slug}/index.mdx`);
  }
}

async function convertMdxToMarkdown(rawMdx: string, slug: string) {
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

// remark plugin to normalize line breaks and spacing
// handles IDE formatter issues where content is split across lines
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
        if (!current || current.type !== 'text') continue;

        const textNode = current as Text;
        const trimmed = textNode.value.replace(/\s+$/, '');
        if (!trimmed) continue;
        if (/\s$/.test(textNode.value)) continue;

        const lastChar = trimmed.slice(-1);
        if (!lastChar || /[\s([{]/.test(lastChar)) continue;

        textNode.value = `${trimmed} `;
      }
    });
  };
}

// remark plugin to transform mdx-specific nodes to markdown equivalents
type ResolveResourcesOptions = {slug: string};

function resolveResourcesPlugin(options?: ResolveResourcesOptions) {
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

  if (node.name === 'Note') {
    return {action: 'replace', node: transformNote(node)};
  }

  if (node.name === 'ImageLightbox' || node.name === 'img') {
    const paragraph = transformImage(node);
    return paragraph
      ? {action: 'replace', node: paragraph}
      : {action: 'remove'};
  }

  if (node.name === 'Video') {
    return {action: 'replace', node: transformVideo(node)};
  }

  return {action: 'remove'};
}

function transformNote(node: MdxJsxNode): Blockquote {
  const emoji = getAttribute(node.attributes, 'emoji');
  const heading = getAttribute(node.attributes, 'heading');
  const prefix = buildNotePrefix(emoji, heading);

  const blockChildren = [...(node.children ?? [])] as Blockquote['children'];

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
  if (!src) {
    return null;
  }

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

function buildNotePrefix(emoji?: string, heading?: string) {
  const nodes: PhrasingContent[] = [];

  if (emoji) {
    nodes.push({type: 'text', value: `${emoji} `});
  }

  if (heading) {
    nodes.push({type: 'text', value: `**${heading}**: `});
  }

  return nodes;
}

function getAttribute(attributes: MdxJsxNode['attributes'], name: string) {
  if (!attributes) return undefined;

  for (const attribute of attributes) {
    if (attribute.type !== 'mdxJsxAttribute') continue;
    if (attribute.name !== name) continue;

    if (typeof attribute.value === 'string') {
      return attribute.value;
    }

    if (
      attribute.value &&
      typeof attribute.value === 'object' &&
      'value' in attribute.value
    ) {
      return String(attribute.value.value).trim();
    }
  }

  return undefined;
}

function resolveAssetUrl(src: string) {
  if (!src || /^https?:\/\//i.test(src) || src.startsWith('//')) {
    return src;
  }

  const bases: string[] = [];
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT ?? '3000';
    bases.push(`http://localhost:${port}`);
  }

  bases.push(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? '',
    process.env.VERCEL_URL ?? '',
  );

  const configuredBase = bases.find(Boolean);

  if (!configuredBase) {
    return src;
  }

  const base = configuredBase.startsWith('http')
    ? configuredBase
    : `https://${configuredBase}`;

  const normalizedBase = base.replace(/\/?$/, '');
  const normalizedPath = src.startsWith('/') ? src.slice(1) : src;
  return `${normalizedBase}/${normalizedPath}`;
}

function resolveDocumentHref(href: string, currentSlug: string) {
  if (!href) {
    return href;
  }

  const trimmed = href.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.startsWith('#') || isAbsoluteUrl(trimmed)) {
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
    docSlug = stripLeadingSlash(pathPart).replace(/^docs\//, '');
  } else {
    const routeSlug = findRouteSlug(pathPart);
    if (routeSlug) {
      docSlug = routeSlug;
    } else if (pathPart.startsWith('./') || pathPart.startsWith('../')) {
      docSlug = resolveRelativeSlug(currentSlug, pathPart);
    } else {
      docSlug = resolveRelativeSlug(currentSlug, `./${pathPart}`);
    }
  }

  if (docSlug !== undefined) {
    const canonicalSlug = findRouteSlug(docSlug) ?? docSlug;
    absolutePath = buildDocsPath(canonicalSlug);
  }

  if (!absolutePath) {
    const absoluteFallback = resolveAssetUrl(pathPart);
    return hashPart ? `${absoluteFallback}#${hashPart}` : absoluteFallback;
  }

  const absolute = resolveAssetUrl(absolutePath);
  return hashPart ? `${absolute}#${hashPart}` : absolute;
}

function resolveRelativeSlug(currentSlug: string, relativePath: string) {
  const baseSegments = currentSlug.split('/').filter(Boolean);
  if (baseSegments.length > 0) {
    baseSegments.pop();
  }

  let remaining = relativePath;
  while (remaining.startsWith('./')) {
    remaining = remaining.slice(2);
  }

  const segments = remaining.split('/');
  const stack = [...baseSegments];

  for (const segment of segments) {
    if (!segment || segment === '.') {
      continue;
    }
    if (segment === '..') {
      if (stack.length > 0) {
        stack.pop();
      }
      continue;
    }
    stack.push(segment);
  }

  return stack.join('/');
}

function buildDocsPath(slug: string) {
  const clean = stripLeadingSlash(slug);
  if (!clean) {
    return '/docs';
  }
  return `/docs/${clean}`;
}

function findRouteSlug(target: string) {
  const normalized = stripLeadingSlash(target);
  return DOC_ROUTE_LOOKUP.get(normalized);
}

function stripLeadingSlash(value: string) {
  return value.replace(/^\/+/, '');
}

function isAbsoluteUrl(url: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//');
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
