import {parseMdx} from '@/lib/mdx';

type CodeBlockProps = {
  mdx: string;
};

const CodeBlock = async ({mdx}: CodeBlockProps) => {
  const highlightedCode = await parseMdx(mdx);

  return <div className="prose w-full">{highlightedCode.content}</div>;
};

export default CodeBlock;
