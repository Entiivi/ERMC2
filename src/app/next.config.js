/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/projektai/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "4000", pathname: "/projektai/**" },
    ],
  },
};

export default nextConfig;
