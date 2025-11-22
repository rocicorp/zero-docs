/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;
