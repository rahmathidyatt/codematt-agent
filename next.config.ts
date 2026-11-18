import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  // Netlify builds use its managed OpenNext adapter. CI/local production
  // smoke tests still use the standalone Node server.
  ...(process.env.NETLIFY === "true" ? {} : { output: "standalone" as const }),
  async redirects() {
    // The old localStorage "billing" demo was replaced by real plans in /pricing.
    return [{ source: "/usage", destination: "/pricing", permanent: false }];
  },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
};
export default config;
