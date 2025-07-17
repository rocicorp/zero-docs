import {ScrollArea} from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {AlignLeftIcon} from 'lucide-react';
import DocsMenu from './docs-menu';
import {Button} from './ui/button';
import {cn} from '@/lib/utils';

export function Leftbar({className}: {className?: string}) {
  return (
    <aside
      className={cn(
        'overflow-y-auto md:flex hidden min-w-[230px] w-[230px] sticky top-16 flex-col py-4 max-h-[calc(100vh-72px)]',
        className,
      )}
    >
      <ScrollArea className="h-full pr-2">
        <DocsMenu />
      </ScrollArea>
    </aside>
  );
}

export function SheetLeftbar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden flex">
          <AlignLeftIcon className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-4 px-0" side="left">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetHeader>
          <div>
            <h2 className="font-extrabold text-start px-8">Docs</h2>
          </div>
        </SheetHeader>
        <ScrollArea className="flex flex-col gap-4">
          <div className=" px-8">
            <DocsMenu isSheet />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
