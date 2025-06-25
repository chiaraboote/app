    /** @type {import('next').NextConfig} */
    const nextConfig = {
      reactStrictMode: true,
      
      // Add this block to ignore ESLint errors during the build
      eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
      },
    };
    
    export default nextConfig;
    