/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 1000,
  experimental: {
    appDir: true,
    serverActions: true,
    nftTracing: true
  },
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.externals = [...config.externals, 'hnswlib-node'];
    return config;
  }
};

module.exports = nextConfig;
