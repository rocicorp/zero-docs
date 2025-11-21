import {getAllPageSlugs} from '@/lib/get-slugs';
import {getDocsForSlug} from '@/lib/mdx';
import {NextRequest, NextResponse} from 'next/server';

type RouteProps = {params: Promise<{slug: string[]}>};

export async function GET(_: NextRequest, {params}: RouteProps) {
  const {slug: slugParams} = await params;

  const pathName = slugParams.join('/').replace(/\.md$/, '');
  const res = await getDocsForSlug(pathName);

  if (!res?.raw) {
    return new NextResponse('MD not found', {status: 404});
  }

  return new NextResponse(res.raw, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

export function generateStaticParams() {
  return getAllPageSlugs();
}
