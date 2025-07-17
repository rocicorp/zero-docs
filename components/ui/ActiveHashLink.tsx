'use client';

import clsx from 'clsx';
import Link from 'next/link';
import {useEffect, useRef} from 'react';
import useHash from '../hooks/useHash';
import {cn} from '@/lib/utils';

interface ActiveHashLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

export const ActiveHashLink: React.FC<ActiveHashLinkProps> = ({
  href,
  children,
  className = '',
  activeClassName = '',
}) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const linkHash = useHash();
  const isActive = linkHash === href;
  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }, [isActive]);

  return (
    <Link
      ref={ref}
      href={href}
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
