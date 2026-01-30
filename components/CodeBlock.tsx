import {parseMdx} from '@/lib/mdx';

type CodeBlockProps = {
  mdx: string;
};

const CodeBlock = async ({mdx}: CodeBlockProps) => {
  const highlightedCode = await parseMdx(mdx);

  return <div className="prose w-full">{highlightedCode.content}</div>;
};

export default CodeBlock;

import {defineMutators, defineMutator} from '@rocicorp/zero';
import {z} from 'zod';

export const mutators = defineMutators({
  playlist: {
    star: defineMutator(
      z.object({
        id: z.string(),
        starred: z.boolean(),
      }),
      async ({tx, args: {id, starred}}) => {
        await tx.mutate.track.update({id, starred});
      },
    ),
  },
});
