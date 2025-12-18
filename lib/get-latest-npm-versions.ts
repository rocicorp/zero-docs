import {unstable_cache} from 'next/cache';

const REVALIDATE_SECONDS = 60 * 30; // 30 minutes
const PACKAGE_NAMES = [
  '@rocicorp/zero',
  'drizzle-zero',
  'prisma-zero',
] as const;

type DistTagsResponse = {
  'dist-tags'?: Record<string, string>;
};

/**
 * Fetches the latest published @rocicorp/zero version from npm (uncached).
 * Throws if the registry cannot be reached or returns an unexpected shape.
 */
async function fetchLatestNpmVersions(): Promise<
  Record<(typeof PACKAGE_NAMES)[number], string>
> {
  const versions = await Promise.all(
    PACKAGE_NAMES.map(async packageName => {
      const version = await getVersionForPackage(packageName);
      return {[packageName]: version};
    }),
  );
  return versions.reduce((acc, curr) => {
    return {...acc, ...curr};
  }, {}) as Record<(typeof PACKAGE_NAMES)[number], string>;
}

/**
 * Fetches the latest published @rocicorp/zero version from npm (uncached).
 * Throws if the registry cannot be reached or returns an unexpected shape.
 */
async function getVersionForPackage(packageName: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`https://registry.npmjs.org/${packageName}`, {
      headers: {accept: 'application/vnd.npm.install-v1+json'},
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`npm registry responded with ${res.status}`);
      return 'latest';
    }

    const data = (await res.json()) as DistTagsResponse;
    const latest = data['dist-tags']?.latest;

    if (!latest) {
      console.error('npm registry response missing dist-tags.latest');
      return 'latest';
    }

    return latest;
  } finally {
    clearTimeout(timeout);
  }

  return 'latest';
}

export const getLatestNpmVersions = unstable_cache(
  fetchLatestNpmVersions,
  ['latest-npm-versions'],
  {revalidate: REVALIDATE_SECONDS},
);
