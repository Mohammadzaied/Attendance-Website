/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NODE_ENV === "development" && {
    allowedDevOrigins: ["http://localhost:3000", "http://192.168.56.1:3000"],
  }),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://attendance-rwtc.runasp.net/:path*",
      },
    ];
  },
};

export default nextConfig;
