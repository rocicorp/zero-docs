import path from 'path';
import fs from 'fs';

export type StaticParam = {slug: string[]};

/**
 * Returns all static params (slug arrays) for docs pages all files under `contents/docs/*.mdx`
 */
export const getAllPageSlugs = (): StaticParam[] => {
  const DOCS_ROOT = path.join(process.cwd(), 'contents/docs');
  const files = getAllMDXFiles(DOCS_ROOT);

  const params: StaticParam[] = files
    .map(fullPath => path.relative(DOCS_ROOT, fullPath))
    .map(relPath => {
      if (relPath.toLowerCase().endsWith('/index.mdx')) {
        const withoutIndex = relPath.replace(/\/index\.mdx$/i, '');
        const segments = withoutIndex === '' ? [] : withoutIndex.split('/');
        return {slug: segments};
      }
      const withoutExt = relPath.replace(/\.mdx$/i, '');
      return {slug: withoutExt.split('/')};
    })
    .filter(p => p.slug.length > 0);

  const seen = new Set<string>();
  return params.filter(p => {
    const key = p.slug.join('/');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Recursively find all `*.mdx` files in subdirectories
 */
export function getAllMDXFiles(dir: string): string[] {
  let files: string[] = [];

  fs.readdirSync(dir, {withFileTypes: true}).forEach(entry => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // If it's a directory, recurse into it
      files = files.concat(getAllMDXFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  });

  return files;
}
