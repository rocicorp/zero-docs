import {getAllPageSlugs} from '@/lib/get-slugs';
import {getDocsForSlug} from '@/lib/mdx';
import {NextRequest, NextResponse} from 'next/server';

export const dynamic = 'force-static';

type RouteProps = {params: Promise<{slug: string[]}>};

const MD_FOOTER = `**For AI agents**: to view all the available documentation, visit https://zero.rocicorp.dev/llms.txt`;

export async function GET(_: NextRequest, {params}: RouteProps) {
  const {slug: slugParams} = await params;

  const pathName = slugParams.join('/').replace(/\.md$/, '');
  const res = await getDocsForSlug(pathName);

  if (!res?.raw) {
    return new NextResponse('MD not found', {status: 404});
  }

  return new NextResponse(`${res.raw}\n\n${MD_FOOTER}`, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control':
        'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}

export function generateStaticParams() {
  return getAllPageSlugs();
}
