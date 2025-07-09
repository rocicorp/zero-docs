import Link from 'next/link';
import {SheetLeftbar} from './leftbar';
import {page_routes} from '@/lib/routes-config';
import ZeroAlphaLogo from './logos/ZeroAlpha';
import dynamic from 'next/dynamic';

const Search = dynamic(() => import('./search'), {
  loading: () => (
    <div className="max-w-56 w-full h-10 bg-input/50 rounded-md animate-pulse" />
  ),
});

export const NAVLINKS = [{title: 'Docs', href: `/docs${page_routes[0].href}`}];

export function Navbar() {
  return (
    <nav className="inner-docs-nav w-full sticky top-0 z-50 md:px-8 px-2 backdrop-filter backdrop-blur-xl bg-opacity-5 h-[72px] grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr] gap-2 items-center max-w-[1250px] mx-auto">
      <SheetLeftbar />
      <Logo />
      <div className="flex items-center justify-end gap-2">
        <Search />
      </div>
    </nav>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 relative xs:absolute md:relative left-1/2 -translate-x-1/2 justify-center "
    >
      <ZeroAlphaLogo className="w-full h-8" />
    </Link>
  );
}
