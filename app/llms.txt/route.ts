import {NextResponse} from 'next/server';
import {getBaseUrl} from '@/lib/docs-utils';
import {generateLlmsTxt} from '@/lib/llms-text';

export const revalidate = false;
export const dynamic = 'force-static';

const TEXT_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'public, max-age=0, must-revalidate',
};

export async function GET() {
  try {
    const baseUrl = getBaseUrl();
    const body = (await generateLlmsTxt(baseUrl)).trim();

    return new NextResponse(body, {headers: TEXT_HEADERS});
  } catch (err) {
    console.error('Error generating /llms.txt:', err);

    return new NextResponse('Internal server error', {
      status: 500,
      headers: TEXT_HEADERS,
    });
  }
}
