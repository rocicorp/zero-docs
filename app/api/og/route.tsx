// app/api/og/route.tsx
import {ImageResponse} from '@vercel/og';
import {NextRequest} from 'next/server';

export const runtime = 'edge'; // Required for @vercel/og

const muotoBold = new URL('../../fonts/muoto-bold.woff', import.meta.url);
const muotoReg = new URL('../../fonts/muoto-regular.woff', import.meta.url);
const zeroDocsLogo = new URL(
  '../../../public/images/zero-docs-logo.svg',
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
          padding: '0 200px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 86,
            letterSpacing: '-2.58px' /* 86 * -3% */,
            fontFamily: 'muoto-bold',
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 48,
              marginTop: 36,
              lineHeight: 1.4,
              padding: '0 80px',
              color: 'white',
              fontWeight: 400,
              fontFamily: 'muoto-reg',
            }}
          >
            {subtitle}
          </div>
        )}
        <img
          src={await loadFileAsBase64URL(zeroDocsLogo, 'image/svg+xml')}
          alt="Zero"
          style={{width: 424, height: 80, marginTop: 75}}
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
        {
          name: 'muoto-reg',
          data: await loadFile(muotoReg),
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
