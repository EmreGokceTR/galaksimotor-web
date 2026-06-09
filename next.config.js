/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Clickjacking koruması — site iframe içinde açılamaz
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // MIME sniffing koruması
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer bilgisini kısıtla
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HTTPS zorunluluğu (2 yıl, subdomain dahil, preload)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Gereksiz tarayıcı özelliklerini kapat
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self), interest-cohort=()" },
  // XSS koruması (eski tarayıcılar için)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // DNS prefetch kontrolü
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

// Statik varlıklar için uzun süreli cache
const staticAssetHeaders = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
];

const nextConfig = {
  reactStrictMode: true,
  // "Powered by Next.js" header'ını kaldır (güvenlik + minik perf)
  poweredByHeader: false,
  // Gzip/Brotli sıkıştırma (Vercel zaten yapar ama Next'in fallback'i için)
  compress: true,
  // SWC ile minify (Terser'den çok daha hızlı)
  swcMinify: true,
  // Production build'de tüm console.log'ları kaldır (error/warn kalır)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // Image optimizasyonu — AVIF + WebP, modern boyutlar, 1 yıl cache
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 yıl
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Lucide-react ve framer-motion gibi büyük paketleri tree-shake et
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "recharts",
      "fuse.js",
      "zustand",
    ],
    // iyzipay node'da dinamik require kullanıyor — server external paket olarak işaretle
    serverComponentsExternalPackages: ["iyzipay", "pdfkit", "bcryptjs", "nodemailer"],
  },
  async headers() {
    return [
      // Genel güvenlik başlıkları — tüm sayfalar
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Statik image / font / asset cache (Next.js'in /_next/static'i zaten cache'lenir
      // ama public/ klasöründekileri de manuel olarak işaretliyoruz)
      {
        source: "/images/(.*)",
        headers: staticAssetHeaders,
      },
      {
        source: "/logos/(.*)",
        headers: staticAssetHeaders,
      },
      {
        source: "/urunler/(.*)",
        headers: staticAssetHeaders,
      },
      {
        source: "/favicon.ico",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      // Ana sayfa için ek hint: tarayıcı sonraki ziyarette
      // 60 sn boyunca cache'ten servis edebilir (kullanıcı geri tuşuna basınca anında).
      // CDN tarafı zaten revalidate=3600 ile cache'liyor.
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400, must-revalidate" },
          // Tarayıcıyı Vercel CDN'e ön-bağlantı (TLS handshake'i paralel başlatır)
          { key: "Link", value: "</_next/static>; rel=preconnect" },
        ],
      },
    ];
  },
  // www → non-www kalıcı yönlendirme (SEO + DNS hız)
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.galaksimotor.com" }],
        destination: "https://galaksimotor.com/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
