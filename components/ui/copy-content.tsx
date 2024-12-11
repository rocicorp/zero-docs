'use client';

import {useEffect} from 'react';

export default function CopyContent({content}: {content: React.ReactNode}) {
  useEffect(() => {
    const copyButtons = document.querySelectorAll('.copy-button');

    copyButtons.forEach(button => {
      const handleClick = () => {
        const codeBlock = button.nextElementSibling?.textContent; // Assumes the code block follows the button
        if (codeBlock) {
          navigator.clipboard.writeText(codeBlock).then(() => {
            // Provide feedback to the user
            button.textContent = 'Copied!';
            setTimeout(() => {
              button.textContent = 'Copy';
            }, 2000);
          });
        }
      };

      button.addEventListener('click', handleClick);

      // Cleanup listener
      return () => {
        button.removeEventListener('click', handleClick);
      };
    });
  }, [content]); // Re-run if content changes

  return <div>{content}</div>;
}
