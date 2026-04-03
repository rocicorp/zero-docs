import {NextRequest, NextResponse} from 'next/server';

const DOCS_PREFIX = '/docs';
const RAW_PREFIX = '/docs/raw';
const DEFAULT_SLUG = 'introduction';

function acceptsMarkdown(request: NextRequest) {
  const accept = request.headers.get('accept');
  return accept ? accept.toLowerCase().includes('text/markdown') : false;
}

function getDocsSlug(pathname: string) {
  const slug = pathname.replace(/^\/docs\/?/, '');
  return slug.length > 0 ? slug : DEFAULT_SLUG;
}

function endsWithMd(pathname: string) {
  return pathname.endsWith('.md');
}

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  if (!pathname.startsWith(DOCS_PREFIX) || pathname.startsWith(RAW_PREFIX)) {
    return NextResponse.next();
  }

  const wantsMd = endsWithMd(pathname);
  const wantsMarkdown = wantsMd || acceptsMarkdown(request);

  if (!wantsMarkdown) {
    const response = NextResponse.next();
    response.headers.set('Vary', 'Accept');
    return response;
  }

  const rawPathname = wantsMd ? pathname.slice(0, -3) : pathname;
  const slug = getDocsSlug(rawPathname);
  const url = request.nextUrl.clone();
  url.pathname = `${RAW_PREFIX}/${slug}`;

  const response = NextResponse.rewrite(url);
  response.headers.set('Vary', 'Accept');
  return response;
}

export const config = {
  matcher: ['/docs/:path*'],
};
