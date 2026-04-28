import {NextRequest, NextResponse} from 'next/server';

const UMAMI_ENDPOINT = 'https://cloud.umami.is/api/send';
const UMAMI_WEBSITE_ID = '88f5bd98-94e6-4de9-bd7d-1a159e162073';
const UMAMI_TIMEOUT_MS = 500;

export async function GET(request: NextRequest) {
  await trackCloudZeroClick(request);

  return NextResponse.redirect(new URL('/#pricing', request.url), {
    status: 307,
  });
}

async function trackCloudZeroClick(request: NextRequest) {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), UMAMI_TIMEOUT_MS);

  try {
    await fetch(UMAMI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          request.headers.get('user-agent') ?? 'zero-docs-cloud-redirect',
      },
      body: JSON.stringify({
        type: 'event',
        payload: {
          hostname: request.nextUrl.hostname,
          language: request.headers.get('accept-language') ?? undefined,
          referrer: request.headers.get('referer') ?? '',
          title: 'Cloud Zero',
          url: '/cloud',
          website: UMAMI_WEBSITE_ID,
        },
      }),
      signal: abortController.signal,
    });
  } catch {
    // Never let analytics interfere with the redirect.
  } finally {
    clearTimeout(timeout);
  }
}
