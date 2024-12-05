"use client";

import React, { useEffect } from "react";
import hljs from "highlight.js";

type CodeBlockProps = {
  code: string;
  language: string; // Highlight.js language name (e.g., "javascript", "typescript")
};

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const highlightedCode = React.useMemo(() => {
    // Pre-highlight the code before rendering
    const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
    return hljs.highlight(code, { language: validLanguage }).value;
  }, [code, language]);

  return (
    <pre>
      {/* Render pre-highlighted HTML */}
      <code
        className={`hljs language-${language}`}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </pre>
  );
};

export default CodeBlock;
