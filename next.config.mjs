/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx', 'txt'],
  serverExternalPackages: ['@typescript/vfs'],
  redirects() {
    return [
      {
        source: '/releases',
        destination: '/docs/release-notes',
        permanent: false,
      },
      {
        source: '/docs',
        destination: '/docs/introduction',
        permanent: false,
      },
      {
        source: '/docs/synced-queries',
        destination: '/docs/queries',
        permanent: false,
      },
      {
        source: '/docs/writing-data',
        destination: '/docs/mutators',
        permanent: false,
      },
      {
        source: '/docs/reading-data',
        destination: '/docs/queries',
        permanent: false,
      },
      {
        source: '/docs/permissions',
        destination: '/docs/auth#permissions',
        permanent: false,
      },
      {
        source: '/docs/debug/permissions',
        destination: '/docs/deprecated/rls-permissions#debugging',
        permanent: false,
      },
      {
        source: '/docs/add-to-existing-project',
        destination: '/docs/install',
        permanent: false,
      },
      {
        source: '/docs/zero-schema',
        destination: '/docs/schema',
        permanent: false,
      },
      {
        source: '/docs/zql-on-the-server',
        destination: '/docs/server-zql',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*.txt',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
          },
        ],
      },
      {
        source: '/:path*.md',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
          },
        ],
      },
      {
        source: '/:path*.mdx',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
          },
        ],
      },
      {
        source: '/:path*.mp4',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
          },
        ],
      },
      {
        source: '/images/:path*.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
