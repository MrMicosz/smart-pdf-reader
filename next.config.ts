import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // จำเป็นสำหรับ pdfjs-dist เพื่อ bundle worker ได้ถูกต้อง
    config.resolve.alias.canvas = false;
    return config;
  },
  turbopack: {},
};

export default nextConfig;
