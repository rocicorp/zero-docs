import path from 'path';
import {promises as fs} from 'fs';
import {compileMDX} from 'next-mdx-remote/rsc';
import {page_routes, ROUTES} from './routes-config';
import remarkGfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeCodeTitles from 'rehype-code-titles';
import rehypeAddCopyButton from '@/lib/rehype-add-copy-button';

// Custom components for MDX
import Note from '@/components/note';
import ImageLightbox from '@/components/ui/ImageLightbox';
import Video from '@/components/ui/Video';
import {Button} from '@/components/ui/button';

const components = {
  Note,
  ImageLightbox,
  Video,
  Button,
};

// Define the structure of the frontmatter
type BaseMdxFrontmatter = {
  title: string;
  description: string;
};

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
    const contentPath = getDocsContentPath(slug);
    const rawMdx = await fs.readFile(contentPath, 'utf-8');
    return await parseMdx<BaseMdxFrontmatter>(rawMdx);
  } catch (err) {
    console.error(`Error fetching docs for slug "${slug}":`, err);
    throw err;
  }
}

// Generate a Table of Contents (TOC) from markdown headings
export async function getDocsTocs(slug: string) {
  const contentPath = getDocsContentPath(slug);
  const rawMdx = await fs.readFile(contentPath, 'utf-8');
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
}

export function getPreviousNext(path: string) {
  const index = page_routes.findIndex(({href}) => href == `/${path}`);
  return {
    prev: page_routes[index - 1],
    next: page_routes[index + 1],
  };
}

// Utility function to create slugs from text
function sluggify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[^a-z0-9-]/g, ''); // Remove non-alphanumeric characters
}

// Get the file path for the docs based on the slug
function getDocsContentPath(slug: string) {
  return path.join(process.cwd(), '/contents/docs/', `${slug}/index.mdx`);
}
