import {ScrollArea} from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {Button} from './ui/button';
import {buttonVariants} from './ui/button';
import {AlignLeftIcon} from 'lucide-react';
import DocsMenu from './docs-menu';
import Image from 'next/image';
import Link from 'next/link';

export function Leftbar() {
  return (
    <aside className="md:flex hidden flex-[1] min-w-[230px] sticky top-16 flex-col py-4">
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
