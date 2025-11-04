import {getAllPageSlugs} from '@/lib/get-slugs';
import {getMarkdownForSlug} from '@/lib/mdx-to-markdown';
import {NextRequest, NextResponse} from 'next/server';

type RouteProps = {params: Promise<{slug: string[]}>};

export async function GET(_: NextRequest, {params}: RouteProps) {
  const {slug} = await params;
  const markdown = await getMarkdownForSlug(slug.join('/'));

  if (!markdown) {
    return new NextResponse('Post not found', {status: 404});
  }

  return new NextResponse(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

export function generateStaticParams() {
  return getAllPageSlugs();
}
