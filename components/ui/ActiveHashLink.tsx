'use client';

import Link from 'next/link';
import {useEffect, useRef} from 'react';
import {cn} from '@/lib/utils';

interface ActiveHashLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  isActive?: boolean;
}

export const ActiveHashLink: React.FC<ActiveHashLinkProps> = ({
  href,
  children,
  className = '',
  activeClassName = '',
  isActive = false,
}) => {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [isActive]);

  return (
    <Link
      ref={ref}
      href={href}
      aria-current={isActive ? 'location' : undefined}
      className={cn(
        className,
        {[activeClassName]: isActive},
        'transition duration-75 ease-out',
      )}
    >
      {children}
    </Link>
  );
};
