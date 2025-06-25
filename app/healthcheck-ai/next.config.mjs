/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // This is the fix.
  // We are explicitly disabling the feature that uses lightningcss.
  experimental: {
    useLightningcss: false,
  },
};

export default nextConfig; 