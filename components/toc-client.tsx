'use client';

import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import clsx from 'clsx';
import {ActiveHashLink} from './ui/ActiveHashLink';
import {ScrollArea} from '@/components/ui/scroll-area';

interface TocEntry {
  href: string;
  level: number;
  text: string;
}

export default function TocClient({tocs}: {tocs: TocEntry[]}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || tocs.length === 0) return;

    const headingElements: HTMLElement[] = tocs
      .map(entry => {
        const id = entry.href.replace('#', '');
        return document.getElementById(id);
      })
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    const callback: IntersectionObserverCallback = entries => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length > 0) {
        const id = visible[0].target.getAttribute('id');
        if (id) {
          setActiveId(`#${id}`);
        }
      }
    };

    const observer = new IntersectionObserver(callback, {
      root: null, // viewport
      rootMargin: '0px 0px -80% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1.0],
    });

    headingElements.forEach(elem => observer.observe(elem));

    return () => observer.disconnect();
  }, [tocs]);

  return (
    <div className="lg:flex hidden toc flex-[1] min-w-[230px] sticky py-8 top-16 h-[calc(100vh-64px)]">
      <div className="flex flex-col gap-3 h-full w-full pl-2">
        {tocs.length > 0 && (
          <>
            <h3 className="font-semibold text-sm">On this page</h3>
            <ScrollArea className="pb-4 h-full pt-0.5">
              <div className="flex flex-col gap-2.5 text-sm dark:text-neutral-300/85 text-neutral-500/85 ml-0.5">
                {tocs.map(({href, level, text}) => (
                  <ActiveHashLink
                    key={href}
                    href={href}
                    activeClassName="text-black dark:text-white"
                    className={clsx({
                      'pl-0': level === 2,
                      'pl-4': level === 3,
                      'pl-8': level === 4,
                      'font-semibold text-black dark:text-white':
                        href === activeId,
                    })}
                  >
                    {text}
                  </ActiveHashLink>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}
