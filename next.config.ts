import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// This dir sits inside a larger checkout (git worktrees under .claude/), so
// several lockfiles / pnpm-workspace.yaml files exist above us and Next infers
// the wrong workspace root. Pin the Turbopack root to THIS project directory
// (resolved dynamically so it's correct in any checkout or worktree).
const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/seed/**',
        search: '',
      },
    ],
  },
  turbopack: {
    root: projectRoot,
  },
  // Everything under /public is a design asset that only ever changes by being
  // re-exported, and Vercel serves those with `max-age=0, must-revalidate` by
  // default — so every repeat visitor re-requests all ~16 of them on every page
  // load. These headers are also what the image optimizer reads to decide how
  // long to keep an optimized variant: its TTL is max(minimumCacheTTL, upstream
  // Cache-Control), so the same rule stops it re-decoding the multi-megabyte
  // envelope/RSVP PNGs every 4 hours.
  //
  // 30 days rather than a year + `immutable`, because these are still being
  // iterated on. When you replace an asset in place, bump a `?v=` on the
  // reference (components/letter/our-story.tsx already does this for the lace
  // mask) — statically imported images are content-hashed and need no bump.
  async headers() {
    const cache = [
      { key: 'Cache-Control', value: 'public, max-age=2592000' },
    ];

    return [
      // Asset directories.
      { source: '/icons/:path*', headers: cache },
      { source: '/florals/:path*', headers: cache },
      { source: '/laces/:path*', headers: cache },
      { source: '/envelope/:path*', headers: cache },
      { source: '/locket/:path*', headers: cache },
      { source: '/music/:path*', headers: cache },
      // Root-level artwork, plus the favicon (a metadata route, not a
      // /public file, but it revalidates on every load just the same).
      { source: '/:file(.*).png', headers: cache },
      { source: '/:file(.*).jpg', headers: cache },
      { source: '/:file(.*).svg', headers: cache },
      { source: '/favicon.ico', headers: cache },
    ];
  },

  // We test this site on real phones and the iOS Simulator, which reach the dev
  // server over the Mac's LAN address rather than localhost. Next blocks
  // cross-origin requests to /_next/* dev resources by default, and the HMR
  // websocket always sends an Origin header — so over a LAN IP the upgrade 403s
  // and the dev client never hydrates: every `motion` element stays frozen at
  // its `initial` style (the countdown band renders as blank white paper).
  // Allowing the private ranges makes phone testing behave like localhost.
  // Development-only setting; it has no effect on `next build`/`next start`.
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.16.*.*', '*.local'],
};

export default nextConfig;
