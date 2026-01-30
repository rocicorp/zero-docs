import path from 'path';
import {promises as fs} from 'fs';
import matter from 'gray-matter';
import {getMarkdownForSlug} from './mdx-to-markdown';
import {llm_sections as llmSections} from './routes-config';
import {getBaseUrl, getDocsContentPath} from './docs-utils';

async function getOutputBase() {
  const basePath = path.join(process.cwd(), 'lib', 'llms-base.md');
  return fs.readFile(basePath, 'utf-8');
}

async function generateLlmsTxt(baseUrl: string): Promise<string> {
  let output = await getOutputBase();

  for (const section of llmSections) {
    output += `\n## ${section.title}\n\n`;

    for (const route of section.pages) {
      if (!route.href) continue;

      const slug = route.href.replace(/^\//, '').replace(/^docs\//, '');
      const url = `${baseUrl}/docs/${slug}`;

      try {
        const contentPath = await getDocsContentPath(slug);
        const rawMdx = await fs.readFile(contentPath, 'utf-8');
        const {data} = matter(rawMdx);
        const description = data.description ?? '';
        const descSuffix = description ? `: ${description}` : '';

        output += `- [${route.title}](${url})${descSuffix}\n`;
      } catch (err) {
        console.warn(`Warning: Could not process route ${route.href}:`, err);
      }
    }
  }

  return output;
}

async function generateLlmsFullTxt(baseUrl: string): Promise<string> {
  let output = await getOutputBase();

  for (const section of llmSections) {
    output += `\n## ${section.title}\n\n`;

    for (const route of section.pages) {
      if (!route.href) continue;

      const slug = route.href.replace(/^\//, '').replace(/^docs\//, '');

      try {
        const markdown = await getMarkdownForSlug(slug);

        if (!markdown) {
          console.warn(`Warning: No markdown generated for ${slug}`);
          continue;
        }

        const url = `${baseUrl}/docs/${slug}`;

        output += '---\n\n';

        if (markdown.startsWith('# ')) {
          const firstNewline = markdown.indexOf('\n');
          const title = markdown.slice(0, firstNewline);
          const rest = markdown.slice(firstNewline).trimStart();

          output += `${title}\n\n`;
          output += `Source: ${url}\n\n`;
          output += `${rest}\n\n`;
        } else {
          output += `Source: ${url}\n\n`;
          output += `${markdown}\n\n`;
        }
      } catch (err) {
        console.warn(`Warning: Error processing ${slug}:`, err);
      }
    }
  }

  return output;
}

async function main() {
  console.log('Generating llms.txt files...');

  const baseUrl = getBaseUrl();
  console.log(`Using base URL: ${baseUrl}`);

  try {
    const llmsTxt = await generateLlmsTxt(baseUrl);
    const llmsTxtPath = path.join(process.cwd(), 'public', 'llms.txt');
    await fs.writeFile(llmsTxtPath, llmsTxt.trim());
    console.log(`✓ Generated ${llmsTxtPath}`);

    const llmsFullTxt = await generateLlmsFullTxt(baseUrl);
    const llmsFullTxtPath = path.join(process.cwd(), 'public', 'llms-full.txt');
    await fs.writeFile(llmsFullTxtPath, llmsFullTxt.trim());
    console.log(`✓ Generated ${llmsFullTxtPath}`);

    console.log('Successfully generated llms.txt files');
  } catch (err) {
    console.error('Error generating llms.txt files:', err);
    process.exit(1);
  }
}

main();
