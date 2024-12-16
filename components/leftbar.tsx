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
    <aside className="md:flex hidden flex-[1] min-w-[230px] sticky top-16 flex-col h-[94.5vh] overflow-y-auto">
      <ScrollArea className="py-4">
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
          <div className="mobile-menu-social-links">
            <h2 className="mobile-menu-header font-extrabold text-start px-8">
              Docs
            </h2>
            <div className="github-discord-mobile">
              <Link
                href="https://github.com/rocicorp/hello-zero"
                className={buttonVariants({variant: 'ghost', size: 'icon'})}
              >
                <Image
                  src="/images/icons/github.svg"
                  alt="Github logo"
                  width={36}
                  height={36}
                  priority
                />
              </Link>
              <Link
                href="https://zero.rocicorp.dev/discord"
                className={buttonVariants({variant: 'ghost', size: 'icon'})}
              >
                <Image
                  src="/images/icons/discord.svg"
                  alt="Discord logo"
                  width={36}
                  height={36}
                  priority
                />
              </Link>
            </div>
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
