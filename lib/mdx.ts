import rehypeAddCopyButton from '@/lib/rehype-add-copy-button';
import {promises as fs} from 'fs';
import {compileMDX} from 'next-mdx-remote/rsc';
import path from 'path';
import {cache} from 'react';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCodeTitles from 'rehype-code-titles';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import {page_routes} from './routes-config';
// Custom components for MDX
import CodeGroup from '@/components/CodeGroup';
import SyncedCode from '@/components/SyncedCode';
import Note from '@/components/note';
import ImageLightbox from '@/components/ui/ImageLightbox';
import Video from '@/components/ui/Video';
import {Button} from '@/components/ui/button';
import {sluggify} from './utils';
import { convertMdxToMarkdown } from './mdx-to-markdown';

const components = {
  Note,
  ImageLightbox,
  Video,
  Button,
  CodeGroup,
  SyncedCode,
};

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
const readRawDoc = cache(async (slug: string) => {
  const contentPath = await getDocsContentPath(slug);
  return fs.readFile(contentPath, 'utf-8');
});

const compileDoc = cache(async (slug: string) => {
  const rawMdx = await readRawDoc(slug);
  return {raw: await convertMdxToMarkdown(rawMdx, slug), parsed: await parseMdx<BaseMdxFrontmatter>(rawMdx)};
});

const extractHeadings = cache(async (slug: string) => {
  const rawMdx = await readRawDoc(slug);
  const headingsRegex = /^(#{2,4})\s(.+)$/gm;
  let match;
  const extractedHeadings: Array<{
    level: number;
    text: string;
    href: string;
  }> = [];

  while ((match = headingsRegex.exec(rawMdx)) !== null) {
    const headingLevel = match[1].length;
    const headingText = match[2].trim();
    const headingSlug = sluggify(headingText);
    extractedHeadings.push({
      level: headingLevel,
      text: headingText,
      href: `#${headingSlug}`,
    });
  }

  return extractedHeadings;
});

export async function getDocsForSlug(slug: string) {
  try {
    return await compileDoc(slug);
  } catch (err) {
    console.error(`Error fetching docs for slug "${slug}":`, err);
    return null;
  }
}

// Generate a Table of Contents (TOC) from markdown headings
export async function getDocsTocs(slug: string) {
  try {
    return await extractHeadings(slug);
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
