/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Clickjacking koruması — site iframe içinde açılamaz
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // MIME sniffing koruması
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer bilgisini kısıtla
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HTTPS zorunluluğu (1 yıl, subdomain dahil)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Gereksiz tarayıcı özelliklerini kapat
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self)" },
  // XSS koruması (eski tarayıcılar için)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // DNS prefetch kontrolü
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
