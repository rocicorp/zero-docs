'use client';

import {ScrollArea} from '@/components/ui/scroll-area';
import type {DocsTocEntry} from '@/lib/docs-headings';
import {cn} from '@/lib/utils';
import {ArrowUpRightFromSquare} from 'lucide-react';
import useActiveTocSection from './hooks/use-active-toc-section';
import {ActiveHashLink} from './ui/ActiveHashLink';
import CopyMarkdownButton from './ui/copy-markdown-button';

export default function Toc({
  tocs,
  path,
  markdown,
  className,
}: {
  tocs: DocsTocEntry[];
  path: string;
  markdown?: string;
  className?: string;
}) {
  const activeHref = useActiveTocSection(tocs);

  return (
    <div
      className={cn(
        'lg:flex hidden toc flex-[1] min-w-[230px] w-[230px] sticky py-8 top-16 h-[calc(100vh-64px)]',
        className,
      )}
    >
      <div className="flex flex-col gap-3 h-full w-full pl-2">
        {tocs.length > 0 && (
          <h3 className="font-semibold text-sm">On this page</h3>
        )}
        <ScrollArea className="pb-4 h-full pt-0.5">
          {tocs.length > 0 && (
            <>
              <div className="flex flex-col gap-2.5 text-sm dark:text-neutral-300/85 text-neutral-500/85 ml-0.5">
                {tocs.map(({href, level, text}) => (
                  <ActiveHashLink
                    key={href}
                    href={href}
                    isActive={activeHref === href}
                    activeClassName="text-foreground font-medium"
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-sm pr-2 hover:text-primary',
                      level === 2 && 'pl-0',
                      level === 3 && 'pl-4',
                      level === 4 && 'pl-8',
                    )}
                  >
                    {text}
                  </ActiveHashLink>
                ))}
              </div>

              <div className="h-px w-full bg-input mt-5" />
            </>
          )}

          <div
            className={cn(
              'flex flex-col items-start gap-2',
              tocs.length > 0 && 'mt-5',
            )}
          >
            {markdown ? <CopyMarkdownButton markdown={markdown} /> : null}
            <a
              href={`https://github.com/rocicorp/zero-docs/blob/main/contents/docs/${path}.mdx`}
              target="_blank"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowUpRightFromSquare className="w-4 h-4" />
              Edit this page on GitHub
            </a>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
