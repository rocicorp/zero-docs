'use client';

import clsx from 'clsx';
import Link from 'next/link';
import {useParams, usePathname} from 'next/navigation';
import {useEffect, useMemo, useRef} from 'react';
import useHash from '../hooks/useHash';

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
      className={clsx(
        className,
        {[activeClassName]: isActive},
        'transition ease-in',
      )}
    >
      {children}
    </Link>
  );
};
