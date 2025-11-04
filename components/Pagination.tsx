import type {getPreviousNext} from '@/lib/mdx';
import {cn} from '@/lib/utils';
import {ChevronLeftIcon, ChevronRightIcon} from 'lucide-react';
import Link from 'next/link';
import {buttonVariants} from './ui/button';

export default function Pagination({
  previousNext,
}: {
  previousNext: ReturnType<typeof getPreviousNext>;
}) {
  return (
    <div className="grid grid-cols-2 flex-grow sm:py-10 py-7 gap-3">
      <div>
        {previousNext.prev && (
          <Link
            className={cn(
              buttonVariants({variant: 'outline'}),
              'no-underline w-full flex flex-col pl-3 items-start transition ease-out whitespace-normal h-fit p-4 text-left hover:bg-inherit hover:border-foreground/30',
            )}
            href={`/docs${previousNext.prev.href}`}
          >
            <span className="flex items-center text-muted-foreground gap-2 text-sm">
              <ChevronLeftIcon className="w-[1rem] h-[1rem] mr-1" />
              Previous
            </span>
            <span className="mt-2 ml-1">{previousNext.prev.title}</span>
          </Link>
        )}
      </div>
      <div>
        {previousNext.next && (
          <Link
            className={cn(
              buttonVariants({variant: 'outline'}),
              'no-underline w-full flex flex-col pr-3 items-end transition ease-out whitespace-normal h-fit p-4 text-right hover:bg-inherit hover:border-foreground/30',
            )}
            href={`/docs${previousNext.next.href}`}
          >
            <span className="flex items-center text-muted-foreground gap-2 text-sm">
              Next
              <ChevronRightIcon className="w-[1rem] h-[1rem] ml-1" />
            </span>
            <span className="mt-2 mr-1">{previousNext.next.title}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
