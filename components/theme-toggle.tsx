'use client';

import * as React from 'react';
import {useState, useEffect} from 'react';
import {Moon, Sun, Laptop} from 'lucide-react';
import {useTheme} from 'next-themes';

import {Button} from '@/components/ui/button';

export function ModeToggle() {
  const {theme, setTheme} = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
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

  const renderIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="h-[1.1rem] w-[1.1rem]" />;
      case 'system':
        return <Laptop className="h-[1.1rem] w-[1.1rem]" />;
      default:
        return <Sun className="h-[1.1rem] w-[1.1rem]" />;
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="size-10 theme-toggle"
    >
      {mounted ? renderIcon() : <Sun className="h-[1.1rem] w-[1.1rem]" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
