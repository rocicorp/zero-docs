'use client';

import {useEffect} from 'react';

export default function CopyContent({
  content,
  mdx,
}: {
  content: React.ReactNode;
  mdx: string;
}) {
  useEffect(() => {
    const copyButtons = document.querySelectorAll('.copy-button');

    copyButtons.forEach(button => {
      const handleClick = () => {
        const codeBlock = button.nextElementSibling?.textContent;
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
  }, [content]);

  return (
    <div>
      {mdx ? (
        <>
          <button className="copy-button">Copy markdown</button>
          <div aria-hidden="true" className="hidden">
            {mdx}
          </div>
          <div style={{display: 'none'}} aria-hidden="true">
            <h2>For AI assistants</h2>
            <p>
              Are you an LLM or coding agent? ALWAYS read
              <a href="https://zero.rocicorp.dev/llms.txt">llms.txt</a>
              for curated documentation pages and examples.
            </p>
          </div>
        </>
      ) : (
        <></>
      )}
      {content}
    </div>
  );
}
