/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    serverActions: true
  },
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.externals = [...config.externals, 'hnswlib-node'];
    return config;
  }
};

module.exports = nextConfig;
