'use client';

import {usePathname} from 'next/navigation';
import {Navbar} from '@/components/navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Conditionally render the Navbar only if not on the root page
  if (pathname === '/') {
    return null;
  }

  return <Navbar />;
}
