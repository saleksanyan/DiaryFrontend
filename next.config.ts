/** @type {import('next').NextConfig} */
import { Configuration } from 'webpack';

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  experimental: {
    appDir: true,
  },
  
  webpack: (config: Configuration, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    if (!dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 200,
      };
    }
    return config;
  }
}

module.exports = nextConfig;