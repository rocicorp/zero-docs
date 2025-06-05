'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {useTheme} from 'next-themes';

export function ModeToggle() {
  // SVGs for the hanging bulb in light/dark/system modes:
  const HangingBulbIcon = ({className = ''}) => (
    <svg
      width="19"
      height="101"
      viewBox="0 0 19 101"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16 78C16 78.5523 15.5523 79 15 79H14L14.0146 79.5449C14.3079 85.0063 18.9998 85.2192 19 92L18.9873 92.4648C18.7189 97.2454 14.3439 101 9.5 101L9.0332 100.988C4.37836 100.757 0.272463 97.0914 0.0126953 92.4648L0 92C0.000197076 85.2192 4.69205 85.0063 4.98535 79.5449L5 79H4C3.44772 79 3 78.5523 3 78V76H16V78ZM6 79C5.99987 82.367 4.54562 84.106 3.29297 85.7344C2.67222 86.5413 2.11393 87.3019 1.69824 88.2578C1.28806 89.2013 1.00005 90.3776 1 92C1.00027 96.379 4.98136 100 9.5 100C14.0186 100 17.9997 96.379 18 92C17.9999 90.3776 17.7119 89.2013 17.3018 88.2578C16.8861 87.3019 16.3278 86.5413 15.707 85.7344C14.4935 84.1568 13.0904 82.4754 13.0039 79.3105L13 79H6ZM9.5 66C13.0899 66 16 68.9101 16 72.5V75H3V72.5C3 68.9101 5.91015 66 9.5 66Z"
        fill="currentColor"
      />
      <rect x="9" width="1" height="67" fill="currentColor" />
    </svg>
  );

  const HangingBulbIconSystem = ({className = ''}) => (
    <svg
      width="19"
      height="101"
      viewBox="0 0 19 101"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16 78C16 78.5523 15.5523 79 15 79H14L14.0146 79.5449C14.3079 85.0063 18.9998 85.2192 19 92L18.9873 92.4648C18.7189 97.2454 14.3439 101 9.5 101L9.0332 100.988C4.37836 100.757 0.272463 97.0914 0.0126953 92.4648L0 92C0.000197076 85.2192 4.69205 85.0063 4.98535 79.5449L5 79H4C3.44772 79 3 78.5523 3 78V76H16V78ZM6 79C5.99987 82.367 4.54562 84.106 3.29297 85.7344C2.67222 86.5413 2.11393 87.3019 1.69824 88.2578C1.28806 89.2013 1.00005 90.3776 1 92C1.00027 96.379 4.98136 100 9.5 100C14.0186 100 17.9997 96.379 18 92C17.9999 90.3776 17.7119 89.2013 17.3018 88.2578C16.8861 87.3019 16.3278 86.5413 15.707 85.7344C14.4935 84.1568 13.0904 82.4754 13.0039 79.3105L13 79H6ZM9.5 66C13.0899 66 16 68.9101 16 72.5V75H3V72.5C3 68.9101 5.91015 66 9.5 66Z"
        fill="currentColor"
      />
      <rect x="9" width="1" height="67" fill="currentColor" />
      <path
        d="M14.7116 92.6073L12.352 91.9495C12.2055 91.9131 12.114 91.8032 12.059 91.6569L11.4001 89.3012C11.29 88.8996 10.7233 88.8996 10.6133 89.3012L9.95439 91.6569C9.91795 91.8032 9.80789 91.8945 9.66139 91.9495L7.30175 92.6073C6.89942 92.7171 6.89942 93.2829 7.30175 93.3927L9.66139 94.0505C9.80789 94.0869 9.89936 94.1968 9.95439 94.3431L10.6133 96.6988C10.7233 97.1004 11.29 97.1004 11.4001 96.6988L12.059 94.3431C12.0954 94.1968 12.2055 94.0877 12.352 94.0505L14.7116 93.3927C15.0961 93.2829 15.0961 92.7164 14.7116 92.6073Z"
        fill="currentColor"
      />
      <path
        d="M7.85582 88.8036L6.676 88.4747C6.60275 88.4565 6.55701 88.4016 6.5295 88.3285L6.20005 87.1506C6.14502 86.9498 5.86167 86.9498 5.80664 87.1506L5.4772 88.3285C5.45897 88.4016 5.40395 88.4473 5.33069 88.4747L4.15088 88.8036C3.94971 88.8586 3.94971 89.1414 4.15088 89.1964L5.33069 89.5253C5.40394 89.5435 5.44968 89.5984 5.4772 89.6715L5.80664 90.8494C5.86167 91.0502 6.14502 91.0502 6.20005 90.8494L6.5295 89.6715C6.54772 89.5984 6.60275 89.5438 6.676 89.5253L7.85582 89.1964C8.04806 89.1414 8.04806 88.8582 7.85582 88.8036Z"
        fill="currentColor"
      />
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
      ? 'Light Mode'
      : theme === 'dark'
        ? 'Dark Mode'
        : 'System Mode';

  return (
    <button
      onClick={onClick}
      className="lightbulb-toggle"
      title={mounted ? tooltip : undefined}
    >
      <PullCord
        className={`pull-cord ${isSwinging ? 'swing-cord' : ''}`}
        onAnimationEnd={onAnimationEnd}
      />
      {mounted ? renderIcon() : <HangingBulbIcon className="hanging-bulb" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
