import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverComponentsExternalPackages: ['@prisma/client', '@neondatabase/serverless'],
};

export default nextConfig;
