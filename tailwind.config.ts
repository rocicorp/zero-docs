import type {Config} from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  safelist: ['swing-cord'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1250px',
      },
    },
    extend: {
      screens: {
        xxs: '320px',
        xs: '420px',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'primary-highlight': {
          DEFAULT: 'hsl(var(--primary-highlight))',
          foreground: 'hsl(var(--primary-highlight-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        code: ['var(--font-code)'],
        regular: ['var(--font-regular)'],
      },
      keyframes: {
        'accordion-down': {
          from: {height: '0', opacity: '0', filter: 'blur(5px)'},
          to: {
            height: 'var(--radix-accordion-content-height)',
            opacity: '1',
            filter: 'blur(0px)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
            opacity: '1',
            filter: 'blur(0px)',
          },
          to: {height: '0', opacity: '0', filter: 'blur(5px)'},
        },
        'collapsible-down': {
          from: {height: '0', opacity: '0', filter: 'blur(5px)'},
          to: {
            height: 'var(--radix-collapsible-content-height)',
            opacity: '1',
            filter: 'blur(0px)',
          },
        },
        'collapsible-up': {
          from: {
            height: 'var(--radix-collapsible-content-height)',
            opacity: '1',
            filter: 'blur(0px)',
          },
          to: {height: '0', opacity: '0', filter: 'blur(5px)'},
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.15s ease-out',
        'accordion-up': 'accordion-up 0.15s ease-out',
        'collapsible-down': 'collapsible-down 0.15s ease-out',
        'collapsible-up': 'collapsible-up 0.15s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;

export default config;
