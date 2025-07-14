import {ScrollArea} from '@/components/ui/scroll-area';
import {cn} from '@/lib/utils';
import {ActiveHashLink} from './ui/ActiveHashLink';

export default function Toc({
  tocs,
}: {
  tocs: {level: number; text: string; href: string}[];
}) {
  return (
    <div className="lg:flex hidden toc flex-[1] min-w-[230px] w-[230px] sticky py-8 top-16 h-[calc(100vh-64px)]">
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
                    className={cn(
                      'flex items-center justify-between gap-2',
                      level === 2 && 'pl-0',
                      level === 3 && 'pl-4',
                      level === 4 && 'pl-8',
                    )}
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
