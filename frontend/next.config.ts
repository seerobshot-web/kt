import type { NextConfig } from "next";

const squareCspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com",
  "frame-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com",
  "connect-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://pci-connect.squareup.com https://pci-connect.squareupsandbox.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net data:",
  "img-src 'self' data: https://web.squarecdn.com https://sandbox.web.squarecdn.com",
].join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/checkout',
        headers: [
          { key: 'Content-Security-Policy', value: squareCspDirectives },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: squareCspDirectives },
        ],
      },
    ];
  },
};

export default nextConfig;
