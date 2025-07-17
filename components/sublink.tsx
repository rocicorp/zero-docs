'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {SheetClose} from '@/components/ui/sheet';
import {icons} from '@/lib/icons';
import {EachRoute} from '@/lib/routes-config';
import {cn} from '@/lib/utils';
import {ChevronRight} from 'lucide-react';
import {usePathname} from 'next/navigation';
import {useEffect, useMemo, useState} from 'react';
import Anchor from './anchor';
import {Button} from './ui/button';

export default function SubLink({
  title,
  href,
  items,
  level,
  isSheet,
  new: isNew,
  icon,
  noLink,
}: EachRoute & {level: number; isSheet: boolean; noLink: boolean}) {
  const path = usePathname();
  const itemsIncludesPath = useMemo(
    () => items?.some(item => item.href && path.endsWith(item.href)),
    [items, path],
  );

  const [isOpen, setIsOpen] = useState(level == 0);

  useEffect(() => {
    if (itemsIncludesPath) {
      setIsOpen(true);
    }
  }, [itemsIncludesPath]);

  const Comp = (
    <Anchor
      className="flex items-center hover:text-primary"
      activeClassName="text-primary font-semibold"
      href={href ?? ''}
    >
      <span>{title}</span>
      {isNew && (
        <span className="new-badge ml-2 rounded px-1 py-0.5 text-xs font-semibold border">
          NEW
        </span>
      )}
    </Anchor>
  );

  const titleOrLink = !noLink ? (
    isSheet ? (
      <SheetClose asChild>{Comp}</SheetClose>
    ) : (
      Comp
    )
  ) : (
    <h4 className="font-semibold sm:text-sm text-primary">{title}</h4>
  );

  if (!items) {
    return titleOrLink;
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex select-none cursor-pointer items-center gap-2">
            {titleOrLink}

            <Button
              className="ml-auto mr-3.5 h-6 w-6"
              variant="link"
              size="icon"
            >
              <ChevronRight
                className={cn(
                  'h-[0.9rem] w-[0.9rem] transition ease-out',
                  isOpen && 'rotate-90',
                )}
              />

              <span className="sr-only">Toggle</span>
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className={cn(
              'flex flex-col items-start sm:text-sm dark:text-neutral-300/85 text-neutral-800 ml-0.5 mt-2.5 gap-3',
              level > 0 && 'pl-4 border-l ml-1',
            )}
          >
            {items?.map(innerLink => {
              const modifiedItems = {
                ...innerLink,
                href: `${href ?? ''}${innerLink.href ?? ''}`,
                level: level + 1,
                isSheet,
                noLink: false,
              };
              return <SubLink key={modifiedItems.href} {...modifiedItems} />;
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
