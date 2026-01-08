'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

export function DocsPreview() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasNavigated, setHasNavigated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (hasNavigated) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      // Start showing preview when within 450px of bottom
      if (distanceFromBottom <= 450) {
        // Calculate progress from 0 to 1 as user scrolls from 450px to 0px from bottom
        const progress = Math.min((450 - distanceFromBottom) / 450, 1);
        setScrollProgress(progress);

        // When fully scrolled (within 20px of bottom), navigate
        if (distanceFromBottom <= 20) {
          setHasNavigated(true);
          // Lock scroll position temporarily
          const currentScroll = window.scrollY;
          document.body.style.overflow = 'hidden';
          document.body.style.position = 'fixed';
          document.body.style.top = `-${currentScroll}px`;
          document.body.style.width = '100%';

          // Navigate after a brief moment
          setTimeout(() => {
            router.push('/docs/quickstart');
          }, 100);
        }
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNavigated, router]);

  const displayProgress = hasNavigated ? 1 : scrollProgress;

  return (
    <>
      {/* Docs preview */}
      {displayProgress > 0 && (
        <div
          className="docs-preview-container"
          style={{
            opacity: Math.pow(displayProgress, 0.7),
            transform: `translateY(${(1 - displayProgress) * 200}px)`,
          }}
        >
          <div className="docs-preview-content">
            <div className="docs-preview-sidebar"></div>
            <div className="docs-preview-main"></div>
            <div className="docs-preview-toc"></div>
          </div>
        </div>
      )}
    </>
  );
}
