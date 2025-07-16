import {ScrollArea} from '@/components/ui/scroll-area';
import {getDocsTocs} from '@/lib/markdown';
import clsx from 'clsx';
import {ArrowUpRightFromSquare} from 'lucide-react';
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
                    activeClassName="text-foreground"
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

              <div className="h-px w-full bg-input mt-5" />

              <a
                href={`https://github.com/rocicorp/zero-docs/blob/main/contents/docs/${path}.mdx`}
                target="_blank"
                className="flex items-center gap-1 mt-5 text-sm text-muted-foreground hover:text-foreground"
              >
                Edit this page on GitHub{' '}
                <ArrowUpRightFromSquare className="w-4 h-4" />
              </a>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}
