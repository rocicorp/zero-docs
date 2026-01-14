'use client';

import {useEffect, useState} from 'react';

export function PageTransition({
  children,
  fromLanding,
}: {
  children: React.ReactNode;
  fromLanding: boolean;
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Only animate if coming from the landing page
    if (fromLanding) {
      sessionStorage.removeItem('fromLanding');
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 700);
      return () => clearTimeout(timer);
    }
  }, [fromLanding]);

  return (
    <div className={animate ? 'page-transition-enter' : ''}>
      {children}
    </div>
  );
}
