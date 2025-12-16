import hljs from 'highlight.js';

type CodeBlockProps = {
  code: string;
  language: string; // Highlight.js language name (e.g., "javascript", "typescript")
};

const CodeBlock = ({code, language}: CodeBlockProps) => {
  const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
  const highlightedCode = hljs.highlight(code, {language: validLanguage}).value;

  return (
    <pre className={`language-${validLanguage}`} tabIndex={0}>
      {/* Render pre-highlighted HTML */}
      <code
        className={`hljs language-${validLanguage}`}
        dangerouslySetInnerHTML={{__html: highlightedCode}}
      />
    </pre>
  );
};

export default CodeBlock;
