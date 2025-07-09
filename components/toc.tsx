'use client';

import {ScrollArea} from '@/components/ui/scroll-area';
import {cn} from '@/lib/utils';
import {useRouter} from 'next/navigation';
import {useMemo} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {ActiveHashLink} from './ui/ActiveHashLink';
import Kbd from './ui/kbd';

export default async function Toc({
  tocs,
}: {
  tocs: {level: number; text: string; href: string}[];
}) {
  const router = useRouter();

  // Filter level 2 TOCs (top-level) and assign hotkeys
  const level2Tocs = useMemo(
    () => (tocs.length > 1 ? tocs.filter(toc => toc.level === 2) : []),
    [tocs],
  );

  const mappedTocs = useMemo(
    () =>
      tocs.map(({href, level, text}, index) => ({
        href,
        level,
        text,
        index,
        hotkey: level === 2 ? level2Tocs.findIndex(t => t.href === href) : null,
      })),
    [tocs, level2Tocs],
  );

  useHotkeys(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], e => {
    const hotkeyIndex = parseInt(e.key);

    const level2Toc = level2Tocs[hotkeyIndex];
    if (level2Toc) {
      router.push(level2Toc.href);
    }
  });

  return (
    <div className="lg:flex hidden toc flex-[1] min-w-[230px] sticky py-8 top-16 h-[calc(100vh-64px)]">
      <div className="flex flex-col gap-3 h-full w-full pl-2">
        {tocs.length > 0 && (
          <>
            <h3 className="font-semibold text-sm">On this page</h3>
            <ScrollArea className="pb-4 h-full pt-0.5">
              <div className="flex flex-col gap-2.5 text-sm dark:text-neutral-300/85 text-neutral-500/85 ml-0.5">
                {mappedTocs.map(({href, level, text, hotkey}) => (
                  <ActiveHashLink
                    key={href}
                    href={href}
                    activeClassName="text-black dark:text-white"
                    className={cn(
                      'flex items-center justify-between gap-2',
                      level === 2 && 'pl-0',
                      level === 3 && 'pl-4',
                      level === 4 && 'pl-8',
                    )}
                  >
                    {text}
                    {hotkey !== null && hotkey >= 0 && hotkey < 10 && (
                      <Kbd size="sm">{hotkey}</Kbd>
                    )}
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
