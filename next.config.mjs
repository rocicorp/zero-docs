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
        source: '/docs/custom-mutators',
        destination: '/docs/writing-data',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
