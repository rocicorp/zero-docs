'use client';

import type {getPreviousNext} from '@/lib/markdown';
import {cn} from '@/lib/utils';
import {ChevronLeftIcon, ChevronRightIcon} from 'lucide-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {buttonVariants} from './ui/button';
import {HotkeyTooltip} from './ui/hotkey-tooltip';

export default function Pagination({
  previousNext,
}: {
  previousNext: ReturnType<typeof getPreviousNext>;
}) {
  const router = useRouter();

  useEffect(() => {
    if (previousNext.next) {
      router.prefetch(`/docs${previousNext.next.href}`);
    }
    if (previousNext.prev) {
      router.prefetch(`/docs${previousNext.prev.href}`);
    }
  }, [router]);

  useHotkeys('j', () => {
    if (previousNext.next) {
      router.push(`/docs${previousNext.next.href}`);
    }
  });

  useHotkeys('k', () => {
    if (previousNext.prev) {
      router.push(`/docs${previousNext.prev.href}`);
    }
  });

  return (
    <div className="grid grid-cols-2 flex-grow sm:py-10 py-7 gap-3">
      <div>
        {previousNext.prev && (
          <HotkeyTooltip
            tooltip={{
              hotkeys: 'K',
              title: 'Go to the previous page',
              side: 'left',
            }}
          >
            <Link
              className={cn(
                buttonVariants({variant: 'outline'}),
                'no-underline w-full flex flex-col pl-3 items-start transition ease-in whitespace-normal h-fit p-4 text-left hover:bg-inherit hover:border-foreground/30',
              )}
              href={`/docs${previousNext.prev.href}`}
            >
              <span className="flex items-center text-muted-foreground gap-2 text-sm">
                <ChevronLeftIcon className="w-[1rem] h-[1rem] mr-1" />
                Previous
              </span>
              <span className="mt-2 ml-1">{previousNext.prev.title}</span>
            </Link>
          </HotkeyTooltip>
        )}
      </div>
      <div>
        {previousNext.next && (
          <HotkeyTooltip
            tooltip={{
              hotkeys: 'J',
              title: 'Go to the next page',
              side: 'right',
            }}
          >
            <Link
              className={cn(
                buttonVariants({variant: 'outline'}),
                'no-underline w-full flex flex-col pr-3 items-end transition ease-in whitespace-normal h-fit p-4 text-right hover:bg-inherit hover:border-foreground/30',
              )}
              href={`/docs${previousNext.next.href}`}
            >
              <span className="flex items-center text-muted-foreground gap-2 text-sm">
                Next
                <ChevronRightIcon className="w-[1rem] h-[1rem] ml-1" />
              </span>
              <span className="mt-2 mr-1">{previousNext.next.title}</span>
            </Link>
          </HotkeyTooltip>
        )}
      </div>
    </div>
  );
}
