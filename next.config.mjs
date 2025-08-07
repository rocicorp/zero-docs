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
};

export default nextConfig;
