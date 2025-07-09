import {cn} from '@/lib/utils';

export default function Kbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        'flex-shrink-0 text-xs text-foreground items-center font-medium font-mono lining-nums gap-0.5 bg-input px-2 py-1 rounded-sm border border-border',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
