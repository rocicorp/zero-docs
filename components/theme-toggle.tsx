'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {useTheme} from 'next-themes';

export function ModeToggle() {
  // SVGs for the hanging bulb in light/dark/system modes:
  const HangingBulbIcon = ({className = ''}) => (
    <svg
      width="19"
      height="94"
      viewBox="0 0 19 94"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16 71C16 71.5523 15.5523 72 15 72H14L14.0146 72.5449C14.3079 78.0063 18.9998 78.2192 19 85L18.9873 85.4648C18.7189 90.2454 14.3439 94 9.5 94L9.0332 93.9883C4.37836 93.7568 0.272463 90.0914 0.0126953 85.4648L0 85C0.000197076 78.2192 4.69205 78.0063 4.98535 72.5449L5 72H4C3.44772 72 3 71.5523 3 71V69H16V71ZM6 72C5.99987 75.367 4.54562 77.106 3.29297 78.7344C2.67222 79.5413 2.11393 80.3019 1.69824 81.2578C1.28806 82.2013 1.00005 83.3776 1 85C1.00027 89.379 4.98136 93 9.5 93C14.0186 93 17.9997 89.379 18 85C17.9999 83.3776 17.7119 82.2013 17.3018 81.2578C16.8861 80.3019 16.3278 79.5413 15.707 78.7344C14.4935 77.1568 13.0904 75.4754 13.0039 72.3105L13 72H6ZM9.5 59C13.0899 59 16 61.9101 16 65.5V68H3V65.5C3 61.9101 5.91015 59 9.5 59Z"
        fill="currentColor"
      />
      <rect x="9" width="1" height="60" fill="url(#paint0_linear_24_62)" />
      <defs>
        <linearGradient
          id="paint0_linear_24_62"
          x1="9.5"
          y1="0"
          x2="9.5"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" stopOpacity="0" />
          <stop offset="1" stopColor="currentColor" />
        </linearGradient>
      </defs>
    </svg>
  );

  const HangingBulbIconSystem = ({className = ''}) => (
    <svg
      width="19"
      height="94"
      viewBox="0 0 19 94"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16 71C16 71.5523 15.5523 72 15 72H14L14.0146 72.5449C14.3079 78.0063 18.9998 78.2192 19 85L18.9873 85.4648C18.7189 90.2454 14.3439 94 9.5 94L9.0332 93.9883C4.37836 93.7568 0.272463 90.0914 0.0126953 85.4648L0 85C0.000197076 78.2192 4.69205 78.0063 4.98535 72.5449L5 72H4C3.44772 72 3 71.5523 3 71V69H16V71ZM6 72C5.99987 75.367 4.54562 77.106 3.29297 78.7344C2.67222 79.5413 2.11393 80.3019 1.69824 81.2578C1.28806 82.2013 1.00005 83.3776 1 85C1.00027 89.379 4.98136 93 9.5 93C14.0186 93 17.9997 89.379 18 85C17.9999 83.3776 17.7119 82.2013 17.3018 81.2578C16.8861 80.3019 16.3278 79.5413 15.707 78.7344C14.4935 77.1568 13.0904 75.4754 13.0039 72.3105L13 72H6ZM9.5 59C13.0899 59 16 61.9101 16 65.5V68H3V65.5C3 61.9101 5.91015 59 9.5 59Z"
        fill="currentColor"
      />
      <rect x="9" width="1" height="60" fill="url(#paint0_linear_24_51)" />
      <path
        d="M8.24956 79L8.10302 80.2843C7.48818 80.4788 6.93012 80.7969 6.46181 81.2105L5.25044 80.6901L4 82.8099L5.06972 83.5738C5.00439 83.8728 4.96715 84.1819 4.96715 84.5C4.96715 84.8181 5.00439 85.1272 5.06972 85.4262L4 86.1901L5.25044 88.3099L6.46181 87.7895C6.93012 88.2031 7.48818 88.5212 8.10302 88.7157L8.24956 90H10.7504L10.897 88.7157C11.5118 88.5212 12.0699 88.2031 12.5382 87.7895L13.7496 88.3099L15 86.1901L13.9303 85.4262C13.9956 85.1272 14.0329 84.8181 14.0329 84.5C14.0329 84.1819 13.9956 83.8728 13.9303 83.5738L15 82.8099L13.7496 80.6901L12.5382 81.2105C12.0699 80.7969 11.5118 80.4788 10.897 80.2843L10.7504 79H8.24956ZM9.5 81.9028C10.9678 81.9028 12.1572 83.0653 12.1572 84.5C12.1572 85.9347 10.9678 87.0972 9.5 87.0972C8.0322 87.0972 6.84281 85.9347 6.84281 84.5C6.84281 83.0653 8.0322 81.9028 9.5 81.9028Z"
        fill="currentColor"
      />
      <defs>
        <linearGradient
          id="paint0_linear_24_51"
          x1="9.5"
          y1="0"
          x2="9.5"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" stopOpacity="0" />
          <stop offset="1" stopColor="currentColor" />
        </linearGradient>
      </defs>
    </svg>
  );

  const PullCord = React.forwardRef<
    SVGSVGElement,
    React.SVGProps<SVGSVGElement> & {
      className?: string;
      onAnimationEnd?: () => void;
    }
  >(({className = '', onAnimationEnd, ...props}, ref) => (
    <svg
      ref={ref}
      width="3"
      height="38"
      viewBox="0 0 3 38"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onAnimationEnd={onAnimationEnd}
      {...props}
    >
      <rect x="1" width="1" height="38" fill="currentColor" />
      <rect y="33.1011" width="3" height="4.89895" fill="currentColor" />
    </svg>
  ));
  PullCord.displayName = 'PullCord';

  const {theme, setTheme} = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [isSwinging, setIsSwinging] = useState(false);

  const onClick = () => {
    setIsSwinging(false);

    setTimeout(() => {
      setIsSwinging(true);
    }, 0);

    const themes: Array<'light' | 'dark' | 'system'> = [
      'light',
      'dark',
      'system',
    ];
    const currentIndex = themes.indexOf(
      (theme as 'light' | 'dark' | 'system') || 'light',
    );
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const onAnimationEnd = () => {
    setIsSwinging(false);
  };

  // Decide which bulb‐SVG to show:
  const renderIcon = () => {
    switch (theme) {
      case 'dark':
        return <HangingBulbIcon className="hanging-bulb" />;
      case 'system':
        return <HangingBulbIconSystem className="hanging-bulb" />;
      default:
        return <HangingBulbIcon className="hanging-bulb" />;
    }
  };

  const tooltip =
    theme === 'light'
      ? 'light mode'
      : theme === 'dark'
        ? 'dark mode'
        : 'system mode';

  return (
    <button onClick={onClick} className="lightbulb-toggle" title={tooltip}>
      <PullCord
        className={`pull-cord ${isSwinging ? 'swing-cord' : ''}`}
        onAnimationEnd={onAnimationEnd}
      />
      {mounted ? renderIcon() : <HangingBulbIcon className="hanging-bulb" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
