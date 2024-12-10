import type { Metadata } from "next";
import localFont from "next/font/local";
import ClientBoundary from "@/components/ClientBoundary"; // Add a wrapper for client components
import "./globals.css";
import Script from "next/script";

const muoto = localFont({
  src: "./fonts/muoto-var.ttf",
  variable: "--font-regular",
  weight: "100 900",
});

const codeFont = localFont({
  src: "./fonts/fira-var.woff2",
  variable: "--font-code",
  weight: "100 900",
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
  title: "Zero Docs",
  description:
    "The official documentation for Zero by Rocicorp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body
        className={`${muoto.variable} ${codeFont.variable} font-regular`}
        suppressHydrationWarning
      >
        <ClientBoundary />
        <main className="sm:container mx-auto w-[88vw] h-auto">{children}</main>
        <Script
          src="/um.js"
          data-website-id="88f5bd98-94e6-4de9-bd7d-1a159e162073"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
