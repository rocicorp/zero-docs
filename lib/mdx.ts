import rehypeAddCopyButton from "@/lib/rehype-add-copy-button";
import { rendererRich, transformerTwoslash } from "@shikijs/twoslash";
import { promises as fs } from "fs";
import { compileMDX } from "next-mdx-remote/rsc";
import path from "node:path";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCodeTitles from "rehype-code-titles";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { page_routes } from "./routes-config";
// Custom components for MDX
import CodeGroup from "@/components/CodeGroup";
import { InstallTableNameInput, InstallTableNameReplace } from "@/components/InstallTableName";
import SyncedCode from "@/components/SyncedCode";
import Note from "@/components/note";
import ImageLightbox from "@/components/ui/ImageLightbox";
import Video from "@/components/ui/Video";
import { Button } from "@/components/ui/button";
import rehypePrettyCode from "rehype-pretty-code";
import { getDocsTocEntries } from "./docs-headings";
import { getLatestNpmVersions } from "./get-latest-npm-versions";
import { convertMdxToMarkdown } from "./mdx-to-markdown";
import highlighter from "./themes/highlighter";

const components = {
  Note,
  ImageLightbox,
  Video,
  Button,
  CodeGroup,
  InstallTableNameInput,
  InstallTableNameReplace,
  SyncedCode,
};

const shikiSchemaFile = `
import {
  boolean,
  createBuilder,
  createSchema,
  number,
  relationships,
  string,
  table,
} from '@rocicorp/zero'

const user = table('user')
  .columns({
    id: string(),
    name: string(),
    role: string(),
  })
  .primaryKey('id')

const post = table('post')
  .columns({
    id: string(),
    authorID: string(),
    isDraft: boolean(),
  })
  .primaryKey('id')

const comment = table('comment')
  .columns({
    id: string(),
    postID: string(),
    body: string(),
  })
  .primaryKey('id')

const commentRelationships = relationships(comment, ({one}) => ({
  post: one({
    sourceField: ['postID'],
    destField: ['id'],
    destSchema: post,
  }),
}))

const issue = table('issue')
  .columns({
    id: number(),
    title: string(),
    created: number(),
    priority: string(),
  })
  .primaryKey('id')

export const schema = createSchema({
  tables: [user, post, comment, issue],
  relationships: [commentRelationships],
})

export type Schema = typeof schema

export const zql = createBuilder(schema)

declare module '@rocicorp/zero' {
  interface DefaultTypes {
    schema: Schema
  }
}
`;

const shikiQueriesFile = `
import {defineQueries, defineQuery} from '@rocicorp/zero'
import {zql} from 'schema.ts'

export const queries = defineQueries({
  posts: {
    all: defineQuery(() => zql.post),
  },
})
`;

const shikiZeroFile = `
import {Zero} from '@rocicorp/zero'
import {schema} from 'schema.ts'

export const zero = new Zero({
  schema,
  userID: 'user-id',
  kvStore: 'mem',
})
`;

// Define the structure of the frontmatter
type BaseMdxFrontmatter = { title: string; description: string };

// Parse MDX content with the given plugins
export async function parseMdx<Frontmatter>(rawMdx: string) {
  return await compileMDX<Frontmatter>({
    source: rawMdx,
    options: {
      parseFrontmatter: true,
      blockJS: false,
      blockDangerousJS: true,
      mdxOptions: {
        rehypePlugins: [
          rehypeCodeTitles, // Adds titles to code blocks
          rehypeSlug, // Adds slugs to headings
          [
            rehypeAutolinkHeadings, // Makes headings clickable
            {
              behavior: "wrap", // Wrap the heading with a clickable anchor
              properties: {
                className: "heading-link", // Add a class for styling
              },
            },
          ],
          [
            rehypePrettyCode,
            {
              theme: {
                dark: "roci-dark",
                light: "roci-light",
              },
              // inline: 'tailing-curly-colon',
              keepBackground: false,
              transformers: [
                transformerTwoslash({
                  onTwoslashError(error, code, lang, options) {
                    console.error("Error in twoslash code block:", {
                      error,
                      code,
                      lang,
                      options,
                    });
                  },
                  explicitTrigger: true,
                  twoslashOptions: {
                    compilerOptions: {
                      allowImportingTsExtensions: true,
                      noEmit: true,
                    },
                    extraFiles: {
                      "schema.ts": shikiSchemaFile,
                      "queries.ts": shikiQueriesFile,
                      "zero.ts": shikiZeroFile,
                    },
                  },
                  renderer: rendererRich(),
                }),
              ],
              getHighlighter: () => highlighter,
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
const readRawDoc = async (slug: string) => {
  const contentPath = await getDocsContentPath(slug);
  return fs.readFile(contentPath, "utf-8");
};

const compileDoc = async (slug: string) => {
  let rawMdx = await readRawDoc(slug);
  const npmVersions = await getLatestNpmVersions();

  rawMdx = rawMdx.replace(
    /rocicorp\/zero([:@])\{version\}/g,
    `rocicorp/zero$1${npmVersions["@rocicorp/zero"]}`,
  );
  rawMdx = rawMdx.replace(
    /drizzle-zero([:@])\{version\}/g,
    `drizzle-zero$1${npmVersions["drizzle-zero"]}`,
  );
  rawMdx = rawMdx.replace(
    /prisma-zero([:@])\{version\}/g,
    `prisma-zero$1${npmVersions["prisma-zero"]}`,
  );

  return {
    raw: await convertMdxToMarkdown(rawMdx, slug),
    parsed: await parseMdx<BaseMdxFrontmatter>(rawMdx),
  };
};

const extractHeadings = async (slug: string) => {
  const rawMdx = await readRawDoc(slug);
  return getDocsTocEntries(rawMdx);
};

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
  const index = page_routes.findIndex(({ href }) => href == `/${path}`);
  return {
    prev: page_routes[index - 1] ?? null,
    next: page_routes[index + 1] ?? null,
  };
}

// Get the file path for the docs based on the slug
async function getDocsContentPath(slug: string) {
  if (slug.endsWith(".mdx")) {
    return path.join(process.cwd(), "/contents/docs/", `${slug}`);
  }

  // If the file exists with .mdx extension, return that path
  const mdxPath = path.join(process.cwd(), "/contents/docs/", `${slug}.mdx`);
  try {
    await fs.stat(mdxPath);
    return mdxPath;
  } catch {
    return path.join(process.cwd(), "/contents/docs/", `${slug}/index.mdx`);
  }
}
