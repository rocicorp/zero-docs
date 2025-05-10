import {ScrollArea} from '@/components/ui/scroll-area';
import {getDocsTocs} from '@/lib/markdown';
import clsx from 'clsx';
import {ActiveHashLink} from './ui/ActiveHashLink';

export default async function Toc({path}: {path: string}) {
  const tocs = await getDocsTocs(path);

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
                      'pl-0': level == 2,
                      'pl-4': level == 3,
                      'pl-8 ': level == 4,
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
