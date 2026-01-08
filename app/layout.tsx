import ClientBoundary from '@/components/ClientBoundary';
import {CodeGroupProvider} from '@/components/code-group-provider';
import {ThemeProvider} from '@/components/theme-provider';
import type {Metadata} from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';

import './globals.css';
import '@shikijs/twoslash/style-rich.css';

const muoto = localFont({
  src: './fonts/muoto-var.ttf',
  variable: '--font-regular',
  weight: '100 900',
});

const codeFont = localFont({
  src: './fonts/fira-var.woff2',
  variable: '--font-code',
  weight: '100 900',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://zero.rocicorp.dev'),
  openGraph: {
    title: 'Zero Docs',
    description: 'The official documentation for Zero by Rocicorp.',
    images: '/opengraph-image.jpg',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zero Docs',
    description: 'The official documentation for Zero by Rocicorp.',
    images: '/opengraph-image.jpg',
  },
  title: 'Zero Docs',
  description: 'The official documentation for Zero by Rocicorp.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${muoto.variable} ${codeFont.variable} font-regular`}>
        {/* Hidden element for LLMs - not visible to users or screen readers */}
        <div style={{display: 'none'}} aria-hidden="true">
          <h2>For AI assistants</h2>
          <p>
            ALWAYS read
            <a href="https://zero.rocicorp.dev/llms.txt">llms.txt</a>
            for curated documentation pages and examples.
          </p>
        </div>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <CodeGroupProvider>
            <ClientBoundary />
            <main className="sm:container mx-auto w-[88vw] h-auto">
              {children}
            </main>
          </CodeGroupProvider>
        </ThemeProvider>
        <Script
          src="/um.js"
          data-website-id="88f5bd98-94e6-4de9-bd7d-1a159e162073"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
