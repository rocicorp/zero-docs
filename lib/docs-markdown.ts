export const DOCS_MARKDOWN_FOOTER =
  '**For AI agents**: to view all the available documentation, visit https://zero.rocicorp.dev/llms.txt';

export function formatDocsMarkdown(markdown: string) {
  return [markdown, DOCS_MARKDOWN_FOOTER].join('\n\n');
}
