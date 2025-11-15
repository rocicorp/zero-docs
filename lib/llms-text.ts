import {promises as fs} from 'fs';
import matter from 'gray-matter';
import {ROUTES} from './routes-config';
import {getDocsContentPath} from './docs-utils';
import {getMarkdownForSlug} from './mdx-to-markdown';

const OUTPUT_BASE = `# Zero

> Zero is a new kind of sync engine powered by queries.

`;

function normalizeSlug(href: string) {
  return href.replace(/^\//, '').replace(/^docs\//, '');
}

export async function generateLlmsTxt(baseUrl: string): Promise<string> {
  let output = OUTPUT_BASE;

  for (const section of ROUTES) {
    output += `## ${section.title}\n\n`;

    if (section.items) {
      for (const item of section.items) {
        if (!item.href) continue;

        const slug = normalizeSlug(item.href);
        const url = `${baseUrl}/docs/${slug}.md`;

        try {
          const contentPath = await getDocsContentPath(slug);
          const rawMdx = await fs.readFile(contentPath, 'utf-8');
          const {data} = matter(rawMdx);
          const description = data.description ?? '';
          const descSuffix = description ? `: ${description}` : '';

          output += `- [${item.title}](${url})${descSuffix}\n`;
        } catch (err) {
          console.warn(`warning: could not process route ${item.href}:`, err);
        }
      }
    }

    output += '\n';
  }

  return output;
}

export async function generateLlmsFullTxt(baseUrl: string): Promise<string> {
  let output = OUTPUT_BASE;

  for (const section of ROUTES) {
    if (section.items) {
      for (const item of section.items) {
        if (!item.href) continue;

        const slug = normalizeSlug(item.href);

        try {
          const markdown = await getMarkdownForSlug(slug);

          if (!markdown) {
            console.warn(`warning: no markdown generated for ${slug}`);
            continue;
          }

          const url = `${baseUrl}/docs/${slug}.md`;

          output += '---\n\n';

          if (markdown.startsWith('# ')) {
            const firstNewline = markdown.indexOf('\n');
            const title =
              firstNewline === -1 ? markdown : markdown.slice(0, firstNewline);
            const rest =
              firstNewline === -1
                ? ''
                : markdown.slice(firstNewline).trimStart();

            output += `${title}\n\n`;
            output += `Source: ${url}\n\n`;
            if (rest) {
              output += `${rest}\n\n`;
            }
          } else {
            output += `Source: ${url}\n\n`;
            output += `${markdown}\n\n`;
          }
        } catch (err) {
          console.warn(`warning: error processing ${slug}:`, err);
        }
      }
    }
  }

  return output;
}
