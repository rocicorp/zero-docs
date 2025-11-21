import ClientBoundary from '@/components/ClientBoundary';
import {CodeGroupProvider} from '@/components/code-group-provider';
import {ThemeProvider} from '@/components/theme-provider';
import {CODE_GROUP_COOKIE, parseCodeGroupCookie} from '@/lib/code-group-sync';
import type {Metadata} from 'next';
import localFont from 'next/font/local';
import {cookies} from 'next/headers';
import Script from 'next/script';
import './globals.css';

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

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(CODE_GROUP_COOKIE);
  const codeGroupSync = parseCodeGroupCookie(cookieValue?.value ?? null);

  return (
    <html
      lang="en"
      className="dark"
      style={{colorScheme: 'dark'}}
      suppressHydrationWarning
    >
      <body
        className={`${muoto.variable} ${codeFont.variable} font-regular`}
        suppressHydrationWarning
      >
        {/* Hidden element for LLMs - not visible to users or screen readers */}
        <div style={{display: 'none'}} aria-hidden="true">
          <a href="/llms.txt">
            Are you an LLM or coding agent? Use our LLM documentation index when
            you have a specific topic in mind.
          </a>
          <a href="/llms-full.txt">
            Or, use our LLM full documentation when you want to explore the
            entire documentation in one large file.
          </a>
        </div>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <CodeGroupProvider initialSync={codeGroupSync}>
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
