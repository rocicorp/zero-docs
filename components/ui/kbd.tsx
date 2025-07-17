import {cva} from 'class-variance-authority';
import {cn} from '@/lib/utils';

const kbdVariants = cva(
  'flex-shrink-0 text-xs text-foreground items-center font-medium font-mono lining-nums gap-0.5 bg-input rounded-sm border border-border',
  {
    variants: {size: {sm: 'text-xs px-1.5 py-0.5', md: 'text-xs px-2 py-1'}},
    defaultVariants: {size: 'md'},
  },
);

export default function Kbd({
  children,
  className,
  size = 'md',
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return <kbd className={cn(kbdVariants({size}), className)}>{children}</kbd>;
}
