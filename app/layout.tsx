import type { Metadata } from "next";
import localFont from "next/font/local";
import ClientBoundary from "@/components/ClientBoundary"; // Add a wrapper for client components
import "./globals.css";

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
  title: "Zero Docs",
  description:
    "This comprehensive documentation template, crafted with Next.js and available as open-source, delivers a sleek and responsive design, tailored to meet all your project documentation requirements.",
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
      </body>
    </html>
  );
}
