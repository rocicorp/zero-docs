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
    ];
  },
  async rewrites() {
    return [
      {
        source: '/docs/:slug*.md',
        destination: '/docs/raw/:slug*',
      },
    ];
  },
};

export default nextConfig;
