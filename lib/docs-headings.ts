import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';
import {toString} from 'mdast-util-to-string';
import type {Heading, Root} from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import {unified} from 'unified';

export const DOC_HEADING_MIN_DEPTH = 2;
export const DOC_HEADING_MAX_DEPTH = 4;

export type DocsHeadingEntry = {
  text: string;
  id: string;
  depth: number;
  index: number;
};

export type DocsTocEntry = {
  level: number;
  text: string;
  href: string;
};

const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/g, ' ').trim();

export function parseDocsMdx(rawMdx: string) {
  const {content} = matter(rawMdx);

  return unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .parse(content) as Root;
}

export function extractDocsHeadingEntries(tree: Root): DocsHeadingEntry[] {
  const slugger = new GithubSlugger();
  const headings: DocsHeadingEntry[] = [];

  tree.children.forEach((node, index) => {
    if (node.type !== 'heading') return;

    const heading = node as Heading;
    if (
      heading.depth < DOC_HEADING_MIN_DEPTH ||
      heading.depth > DOC_HEADING_MAX_DEPTH
    ) {
      return;
    }

    const text = normalizeWhitespace(toString(heading));
    if (!text) return;

    headings.push({
      text,
      id: slugger.slug(text),
      depth: heading.depth,
      index,
    });
  });

  return headings;
}

export function getDocsHeadingEntries(rawMdx: string) {
  return extractDocsHeadingEntries(parseDocsMdx(rawMdx));
}

export function toDocsTocEntries(headings: DocsHeadingEntry[]): DocsTocEntry[] {
  return headings.map(({depth, text, id}) => ({
    level: depth,
    text,
    href: `#${id}`,
  }));
}

export function getDocsTocEntries(rawMdx: string) {
  return toDocsTocEntries(getDocsHeadingEntries(rawMdx));
}
