/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ["your-supabase-domain.supabase.co"],
  },
  // Content Security Policy for TinyMCE
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.tiny.cloud; " +
              "style-src 'self' 'unsafe-inline' cdn.tiny.cloud; " +
              "img-src 'self' data: blob: https: http:; " +
              "font-src 'self' cdn.tiny.cloud; " +
              "connect-src 'self' cdn.tiny.cloud uploadcare.com; " +
              "frame-src 'self' cdn.tiny.cloud;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
