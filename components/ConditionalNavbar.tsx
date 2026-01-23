'use client';

import {usePathname} from 'next/navigation';
import {Navbar} from '@/components/navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Hide navbar only on the root page, show on all docs pages including introduction
  if (pathname === '/') {
    return null;
  }

  return <Navbar />;
}
