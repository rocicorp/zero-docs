import {cn} from '@/lib/utils';
import {useRef} from 'react';
import Kbd from './kbd';
import {Tooltip, TooltipContent, TooltipTrigger} from './tooltip';

export type HotkeyTooltipProps = {
  tooltip: {
    title?: string | null;
    hotkeys?: string | null;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
  } | null;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
} & React.ComponentProps<typeof TooltipTrigger>;

export const HotkeyTooltip = ({
  children,
  tooltip,
  className,
  disabled,
  ...props
}: HotkeyTooltipProps) => {
  const ref = useRef<HTMLButtonElement | null>(null);

  if (!tooltip) {
    return children;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        ref={ref}
        className={cn('cursor-pointer', className)}
        data-hotkey={tooltip.hotkeys}
        asChild
        {...props}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        align={tooltip.align}
        side={tooltip.side ?? 'bottom'}
        className={cn('flex max-w-[350px] items-center gap-2')}
      >
        <span className="text-xs">{tooltip.title}</span>
        {tooltip.hotkeys && <Kbd>{tooltip.hotkeys}</Kbd>}
      </TooltipContent>
    </Tooltip>
  );
};
