/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer }) {
    if (!isServer) {
      config.module.rules.push({
        test: /\.worker\.ts$/,
        use: { loader: "worker-loader" },
      });

      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        worker_threads: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
