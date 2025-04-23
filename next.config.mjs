/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  
  // Disable ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;