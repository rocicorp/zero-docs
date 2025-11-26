/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx', 'txt'],
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
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
          },
        ],
      },
      {
        source: '/:path*.md',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
          },
        ],
      },
      {
        source: '/:path*.mdx',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
