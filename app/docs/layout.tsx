import {Leftbar} from '@/components/leftbar';

// Force this layout to be fully static at build time and restrict to generated params
export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex relative items-start gap-14 w-full max-w-full">
      <Leftbar key="leftbar" />
      {children}
    </div>
  );
}
