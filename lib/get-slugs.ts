import fs from 'fs';
import path from 'path';
import {page_routes} from './routes-config';

export type StaticParam = {slug: string[]};

/**
 * Returns all static params (slug arrays) for docs pages, including all routes from `page_routes`
 * and one entry per release note file under `contents/docs/release-notes/*.mdx`
 */
export const getAllPageSlugs = (): StaticParam[] => {
  const releaseNotesDir = path.join(
    process.cwd(),
    'contents/docs/release-notes',
  );

  const releaseNotesFiles = fs.existsSync(releaseNotesDir)
    ? fs
        .readdirSync(releaseNotesDir)
        .filter(name => name.toLowerCase().endsWith('.mdx'))
    : [];

  const releaseNotesIndex: StaticParam[] = releaseNotesFiles.includes(
    'index.mdx',
  )
    ? [{slug: ['release-notes']}]
    : [];

  const releaseNotesSlugs: StaticParam[] = releaseNotesFiles
    .filter(name => name !== 'index.mdx')
    .map(file => ({slug: ['release-notes', file.replace(/\.mdx$/, '')]}));

  const routeSlugs: StaticParam[] = page_routes
    .map(item => ({slug: item.href.split('/').slice(1)}))
    .filter(p => p.slug.length > 0);

  const merged: StaticParam[] = [
    ...routeSlugs,
    ...releaseNotesIndex,
    ...releaseNotesSlugs,
  ];

  const seen = new Set<string>();
  return merged.filter(param => {
    const key = param.slug.join('/');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
