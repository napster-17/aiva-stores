import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['nbgfxirilissmfadmbdd.supabase.co'], 
  },
};

export default nextConfig;
