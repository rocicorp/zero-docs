import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import {unified} from 'unified';
import {visit} from 'unist-util-visit';

// Define the root directory where docs are stored
const DOCS_ROOT = path.join(process.cwd(), 'contents/docs');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'search-index.json');

// Define the structure of a document for indexing
interface SearchDocument {
  id: string;
  title: string;
  content: string;
  url: string;
  headings: {
    text: string;
    id: string;
  }[];
}

/**
 * Recursively find all `index.mdx` files in subdirectories
 */
function getAllMDXFiles(dir: string): string[] {
  let files: string[] = [];

  fs.readdirSync(dir, {withFileTypes: true}).forEach(entry => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // If it's a directory, recurse into it
      files = files.concat(getAllMDXFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  });

  return files;
}

/**
 * Extract headings with IDs from MDX content
 */
function extractHeadings(content: string): {text: string; id: string}[] {
  const headings: {text: string; id: string}[] = [];

  const tree = unified().use(remarkParse).parse(content);

  visit(tree, 'heading', (node: any) => {
    const text = node.children
      .filter((child: any) => child.type === 'text')
      .map((child: any) => child.value)
      .join('');

    // Extract the slug ID from the heading node
    const id = text
      .toLowerCase()
      .replace(/[^\w]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (text && id) {
      headings.push({text, id});
    }
  });

  return headings;
}

/**
 * Extracts content from an MDX file and processes it into plain text
 */
async function extractTextFromMDX(filePath: string): Promise<SearchDocument> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const {content, data} = matter(fileContent); // Extract frontmatter

  // Convert MDX content to plain text (ignoring JSX)
  const plainText = await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .process(content);

  // Extract headings with IDs
  const headings = extractHeadings(content);

  // Derive a URL from the file name
  const pathWithoutExtension = path
    .relative(DOCS_ROOT, filePath)
    .replace(/\.mdx$/, '');
  const url = `/docs/${pathWithoutExtension}`;

  return {
    id: pathWithoutExtension, // Use file name as ID
    title: data.title || pathWithoutExtension, // Use frontmatter title or fallback to path
    url,
    content: plainText.toString().replace(/\n+/g, ' ').trim(),
    headings, // Include extracted headings with IDs
  };
}

/**
 * Generates a search index from all found MDX files
 */
async function generateSearchIndex() {
  const files = getAllMDXFiles(DOCS_ROOT);
  const index: SearchDocument[] = await Promise.all(
    files.map(file => extractTextFromMDX(file)),
  );

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
  console.log(`✅ Search index generated: ${OUTPUT_FILE}`);
}

// Run the script
generateSearchIndex().catch(console.error);
