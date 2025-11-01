import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  env: {
    BACKEND_API_URL: process.env.BACKEND_API_URL,
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
