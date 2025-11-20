import {Leftbar} from '@/components/leftbar';

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
