import Image from 'next/image';
import Link from 'next/link';
import Anchor from './anchor';
import {SheetLeftbar} from './leftbar';
import Search from './search';
import {page_routes} from '@/lib/routes-config';
import {buttonVariants} from './ui/button';

export const NAVLINKS = [
  {
    title: 'Docs',
    href: `/docs${page_routes[0].href}`,
  },
];

export function Navbar() {
  return (
    <nav className="top-nav w-full sticky top-0 z-50 lg:px-4 backdrop-filter backdrop-blur-xl bg-opacity-5">
      <div className="inner-nav-container sm:container h-full max-sm:px-3 flex items-center justify-between">
        <SheetLeftbar />
        <div className="inner-nav-items flex items-center gap-9">
          <Logo />
          {/* {NAVLINKS.map((item) => {
              return (
                <Anchor
                  key={item.title + item.href}
                  activeClassName="text-primary font-semibold"
                  absolute
                  className="flex items-center gap-1"
                  href={item.href}
                >
                  {item.title}
                </Anchor>
              );
            })} */}
          <Search />
        </div>
      </div>
    </nav>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 logo-link">
      <Image
        src="/images/zero-logo-alpha.svg"
        alt="Zero Alpha Logo"
        width={173}
        height={32}
        priority
      />
    </Link>
  );
}
