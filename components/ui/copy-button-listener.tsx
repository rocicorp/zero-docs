'use client';

import {useEffect} from 'react';

export default function CopyButtonListener() {
  useEffect(() => {
    const copyButtons = document.querySelectorAll<HTMLButtonElement>(
      '.copy-button',
    );

    const cleanups: Array<() => void> = [];

    copyButtons.forEach(button => {
      const handleClick = () => {
        const codeBlock = button.nextElementSibling?.textContent;
        if (!codeBlock) return;

        navigator.clipboard.writeText(codeBlock).then(() => {
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = 'Copy';
          }, 2000);
        });
      };

      button.addEventListener('click', handleClick);
      cleanups.push(() => button.removeEventListener('click', handleClick));
    });

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, []);

  return null;
}
