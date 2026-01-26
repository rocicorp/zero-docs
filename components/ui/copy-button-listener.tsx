'use client';

import {useEffect} from 'react';

export default function CopyButtonListener() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const button = target.closest<HTMLButtonElement>('button.copy-button');
      if (!button) return;

      const pre = button.closest('pre');
      const codeElement = pre?.querySelector('code');
      const codeBlock =
        codeElement?.textContent ?? button.nextElementSibling?.textContent;

      if (!codeBlock) return;

      navigator.clipboard.writeText(codeBlock).then(() => {
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
