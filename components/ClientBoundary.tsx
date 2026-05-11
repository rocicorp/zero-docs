'use client';

import ConditionalNavbar from '@/components/ConditionalNavbar';
import TwoslashPopovers from '@/components/TwoslashPopovers';

export default function ClientBoundary() {
  return (
    <>
      <ConditionalNavbar />
      <TwoslashPopovers />
    </>
  );
}
