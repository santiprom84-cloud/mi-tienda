/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (para imágenes subidas al proyecto)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      // Cualquier URL HTTPS (para imágenes de productos desde URLs externas)
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
