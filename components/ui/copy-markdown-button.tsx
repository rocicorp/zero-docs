'use client';

import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const RESET_DELAY_MS = 2000;
const LABEL = 'Copy as markdown';

export default function CopyMarkdownButton({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }

    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsCopied(false);
    }, RESET_DELAY_MS);
  };

  const Icon = isCopied ? Check : Copy;

  return (
    <button
      type="button"
      className={cn(
        'flex items-center gap-2 rounded-sm border-0 bg-transparent p-0 text-left text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      onClick={handleCopy}
      aria-label="Copy page as markdown"
      title="Copy this page as markdown"
    >
      <Icon className="h-4 w-4" />
      {LABEL}
    </button>
  );
}
