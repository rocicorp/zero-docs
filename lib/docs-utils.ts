import path from 'path';
import {promises as fs} from 'fs';

export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT ?? '3000';
    return `http://localhost:${port}`;
  }

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (!vercelUrl) return 'https://zero.rocicorp.dev';

  return `https://${vercelUrl}`;
}

export async function getDocsContentPath(slug: string) {
  const mdxPath = path.join(process.cwd(), '/contents/docs/', `${slug}.mdx`);
  try {
    await fs.stat(mdxPath);
    return mdxPath;
  } catch {
    return path.join(process.cwd(), '/contents/docs/', `${slug}/index.mdx`);
  }
}

