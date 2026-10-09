import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Every page is statically rendered and all assets (including next/font's
// self-hosted Google Fonts) come from our own origin, so a strict nonce-free
// CSP fits. 'unsafe-inline' on script-src is required by Next's inline
// hydration scripts without nonces; 'unsafe-eval' is only for dev HMR.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The embed script is loaded cross-origin by publisher sites.
      {
        source: "/vi-widget.js",
        headers: [{ key: "Cross-Origin-Resource-Policy", value: "cross-origin" }],
      },
    ];
  },
};

export default nextConfig;
