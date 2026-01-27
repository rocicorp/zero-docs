import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import {pathToFileURL} from 'node:url';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import {unified} from 'unified';
import {visit} from 'unist-util-visit';
import {toString} from 'mdast-util-to-string';
import GithubSlugger from 'github-slugger';
import strip from 'strip-markdown';
import type {Content, Heading, Root} from 'mdast';
import type {Node, Parent} from 'unist';
import {getAllMDXFiles} from './get-slugs';
import type {SearchDocument} from './search-types';

const DOCS_ROOT = path.join(process.cwd(), 'contents/docs');
const OUTPUT_FILE = path.join(process.cwd(), 'assets', 'search-index.json');
const HEADING_MIN_DEPTH = 2;
const HEADING_MAX_DEPTH = 4;

type HeadingEntry = {
  text: string;
  id: string;
  depth: number;
  index: number;
};

const cloneTree = <T>(value: T) => JSON.parse(JSON.stringify(value)) as T;

const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/g, ' ').trim();

function unwrapMdxNodes() {
  return (tree: Node) => {
    visit(
      tree,
      ['mdxJsxFlowElement', 'mdxJsxTextElement'],
      (node, index, parent) => {
        if (!parent || index === undefined) return;
        const parentNode = parent as Parent;
        const mdxNode = node as Node & {children?: Node[]};
        const children = mdxNode.children ?? [];
        parentNode.children.splice(index, 1, ...children);
        return index;
      },
    );

    visit(
      tree,
      ['mdxFlowExpression', 'mdxTextExpression', 'mdxjsEsm'],
      (node, index, parent) => {
        if (!parent || index === undefined) return;
        const parentNode = parent as Parent;
        parentNode.children.splice(index, 1);
        return index;
      },
    );
  };
}

const parseMdx = (content: string) =>
  unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .parse(content) as Root;

function extractHeadingEntries(tree: Root): HeadingEntry[] {
  const slugger = new GithubSlugger();
  const headings: HeadingEntry[] = [];

  tree.children.forEach((node, index) => {
    if (node.type !== 'heading') return;
    const heading = node as Heading;
    if (
      heading.depth < HEADING_MIN_DEPTH ||
      heading.depth > HEADING_MAX_DEPTH
    ) {
      return;
    }

    const text = normalizeWhitespace(toString(heading));
    if (!text) return;
    const id = slugger.slug(text);
    headings.push({text, id, depth: heading.depth, index});
  });

  return headings;
}

const findSectionEndIndex = (
  heading: HeadingEntry,
  headings: HeadingEntry[],
  totalNodes: number,
) => {
  for (const candidate of headings) {
    if (candidate.index <= heading.index) continue;
    if (candidate.depth <= heading.depth) return candidate.index;
  }

  return totalNodes;
};

async function mdastNodesToText(nodes: Content[]) {
  const tree: Root = {type: 'root', children: cloneTree(nodes)};
  const stripped = await unified()
    .use(unwrapMdxNodes)
    .use(strip, {keep: ['code', 'table']})
    .run(tree);
  const strippedRoot = stripped as Root;
  const text = strippedRoot.children.map(node => toString(node)).join(' ');
  return normalizeWhitespace(text);
}

let index = 0;

export async function extractDocumentsFromMDX(
  filePath: string,
): Promise<SearchDocument[]> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const {content, data} = matter(fileContent);

  const mdast = parseMdx(content);
  const headingEntries = extractHeadingEntries(mdast);
  const plainText = await mdastNodesToText(mdast.children as Content[]);

  const pathWithoutExtension = path
    .relative(DOCS_ROOT, filePath)
    .replace(/\/index\.mdx$/, '')
    .replace(/\.mdx$/, '');
  const cleanPath = pathWithoutExtension.trim();
  const url = cleanPath ? `/docs/${cleanPath}` : '/docs';
  const title = (data.title || cleanPath || 'Docs') as string;

  const pageDocument: SearchDocument = {
    id: `${index++}-${cleanPath}`,
    title,
    searchTitle: title,
    url,
    content: plainText,
    headings: headingEntries.map(({text, id}) => ({text, id})),
    kind: 'page',
  };

  const sectionDocuments = await Promise.all(
    headingEntries.map(async heading => {
      const endIndex = findSectionEndIndex(
        heading,
        headingEntries,
        mdast.children.length,
      );
      const sectionNodes = mdast.children.slice(
        heading.index + 1,
        endIndex,
      ) as Content[];
      const sectionContent = await mdastNodesToText(sectionNodes);

      return {
        id: `${index++}-${cleanPath}#${heading.id}`,
        title,
        searchTitle: heading.text,
        sectionTitle: heading.text,
        sectionId: heading.id,
        url,
        content: sectionContent,
        kind: 'section',
      } satisfies SearchDocument;
    }),
  );

  return [pageDocument, ...sectionDocuments];
}

async function generateSearchIndex() {
  const files = getAllMDXFiles(DOCS_ROOT);
  const index = (
    await Promise.all(files.map(file => extractDocumentsFromMDX(file)))
  ).flat();

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
  console.log(`✅ Search index generated: ${OUTPUT_FILE}`);
}

const isDirectRun =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectRun) {
  generateSearchIndex().catch(console.error);
}
