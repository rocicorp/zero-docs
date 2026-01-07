'use client';

import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';

export function PageTransition({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation on route change
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 700);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={animate ? 'page-transition-enter' : ''}>
      {children}
    </div>
  );
}
