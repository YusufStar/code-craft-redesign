/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // fs modülünü devre dışı bırak
        path: false, // path modülünü devre dışı bırak
      };
    }
    return config;
  },
};

module.exports = nextConfig;
