    /** @type {import('next').NextConfig} */
    const nextConfig = {
      reactStrictMode: true,
      
      // Ignore ESLint errors during the build
      eslint: {
        ignoreDuringBuilds: true,
      },
      
      // Add this block to ignore TypeScript errors during the build
      typescript: {
        // Warning: This allows production builds to successfully complete even if
        // your project has TypeScript errors.
        ignoreBuildErrors: true,
      },
    };
    
    export default nextConfig;