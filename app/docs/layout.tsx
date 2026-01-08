'use client';

import {Leftbar} from '@/components/leftbar';
import {PageTransition} from '@/components/PageTransition';
import {useEffect} from 'react';

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // Reset body styles and scroll to top when docs layout mounts
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex relative items-start gap-14 w-full max-w-full">
      <Leftbar key="leftbar" className="sidebar-fade-in" />
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
