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
        destination: '/docs/deprecated/crud-mutators',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
