'use client';

import {useEffect} from 'react';

const shellLanguages = new Set(['bash', 'sh', 'shell', 'zsh']);

// Strip shell comments so pasted snippets work in zsh (which doesn't treat
// `#` as a comment in interactive mode by default). Full-line comments are
// dropped; inline comments (a `#` preceded by whitespace, outside quotes —
// i.e. bash's own comment rule) are trimmed off the end of the line. This
// leaves `$#`, `${#arr}`, `url#frag`, and `"# in a string"` untouched.
function stripShellComments(line: string): string | null {
  if (line.trimStart().startsWith('#')) return null;
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "'" && !inDouble) inSingle = !inSingle;
    else if (c === '"' && !inSingle) inDouble = !inDouble;
    else if (c === '#' && !inSingle && !inDouble && /\s/.test(line[i - 1] ?? '')) {
      return line.slice(0, i).replace(/\s+$/, '');
    }
  }
  return line;
}

export default function CopyButtonListener() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const button = target.closest<HTMLButtonElement>('button.copy-button');
      if (!button) return;

      const pre = button.closest('pre');
      const codeElement = pre?.querySelector('code');
      const language =
        pre?.getAttribute('data-language') ??
        codeElement?.getAttribute('data-language');
      const codeBlock =
        codeElement?.textContent ?? button.nextElementSibling?.textContent;

      if (!codeBlock) return;

      const textToCopy = shellLanguages.has(language ?? '')
        ? codeBlock
            .split('\n')
            .map(stripShellComments)
            .filter((line): line is string => line !== null)
            .join('\n')
        : codeBlock;

      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        window.setTimeout(() => {
          button.textContent = originalText || 'Copy';
        }, 2000);
      });
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}
