// app/api/og/route.tsx
import {ImageResponse} from '@vercel/og';
import {NextRequest} from 'next/server';

export const runtime = 'edge'; // Required for @vercel/og

const muotoBold = new URL('../../fonts/muoto-bold.woff', import.meta.url);
const zeroLogo = new URL(
  '../../../public/images/zero-logo.svg',
  import.meta.url,
);

export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const title = searchParams.get('title') ?? 'General Purpose Sync for the Web';
  const subtitle = searchParams.get('subtitle');

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          backgroundColor: 'black',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'muoto-bold',
          padding: '0 200px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 86,
            letterSpacing: '-2.58px' /* 86 * -3% */,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 30,
              marginTop: 15,
              color: 'white',
              fontFamily: 'muoto-bold',
              letterSpacing: '-.09px' /* 48 * -3% */,
            }}
          >
            {subtitle}
          </div>
        )}
        <img
          src={await loadFileAsBase64URL(zeroLogo, 'image/svg+xml')}
          alt="Zero"
          style={{width: 266, height: 72.88, marginTop: 75}}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'muoto-bold',
          data: await loadFile(muotoBold),
        },
      ],
    },
  );
}

async function loadFileAsBase64URL(url: URL, mimetype: string) {
  const buffer = await loadFile(url);
  const b64 = Buffer.from(buffer).toString('base64');
  return `data:${mimetype};base64,${b64}`;
}

async function loadFile(url: URL) {
  const res = await fetch(url);
  return await res.arrayBuffer();
}
