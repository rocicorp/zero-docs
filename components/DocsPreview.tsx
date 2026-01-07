'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

export function DocsPreview() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (hasNavigated) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      // Show scroll indicator when within 1000px of bottom
      if (distanceFromBottom <= 1000 && distanceFromBottom > 400) {
        setShowIndicator(true);
      } else {
        setShowIndicator(false);
      }

      // Start showing preview when within 400px of bottom
      if (distanceFromBottom <= 400) {
        // Calculate progress from 0 to 1 as user scrolls from 400px to 0px from bottom
        const progress = Math.min((400 - distanceFromBottom) / 400, 1);
        setScrollProgress(progress);

        // When fully scrolled (within 20px of bottom), navigate
        if (distanceFromBottom <= 20) {
          setHasNavigated(true);
          router.push('/docs/quickstart');
        }
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNavigated, router]);

  return (
    <>
      {/* Scroll indicator */}
      {showIndicator && (
        <div className="scroll-indicator">
          <div className="scroll-indicator-content">
            <svg
              className="scroll-indicator-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
            <span>Keep scrolling to explore the docs</span>
          </div>
        </div>
      )}

      {/* Docs preview */}
      {scrollProgress > 0 && (
        <div
          className="docs-preview-container"
          style={{
            opacity: scrollProgress,
            transform: `translateY(${(1 - scrollProgress) * 100}px)`,
          }}
        >
          <div className="docs-preview-content">
            <div className="docs-preview-sidebar"></div>
            <div className="docs-preview-main">
              <h1>Quickstart</h1>
              <p>Get started with Zero in under 5 minutes...</p>
            </div>
            <div className="docs-preview-toc"></div>
          </div>
        </div>
      )}
    </>
  );
}
