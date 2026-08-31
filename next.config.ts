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
    // The optimizer re-encodes the multi-megabyte artwork once per requested
    // width, so a cached variant is the expensive artifact to keep. An
    // optimized image's max-age is `max(minimumCacheTTL, upstream
    // Cache-Control)`, so pinning the floor at 30 days does two things: it
    // matches the `/public` policy in `headers()` below without depending on
    // it. Statically imported images bypass this entirely — they are
    // content-hashed and the optimizer marks them `immutable`.
    minimumCacheTTL: 2592000, // 30 days
    // Allowlist the qualities the optimizer will encode. Every `<Image>` here
    // uses the default 75; pinning it stops a future `quality={90}` from
    // silently doubling the number of cached variants per image.
    qualities: [75],
  },
  turbopack: {
    root: projectRoot,
  },
  // Everything under /public is a design asset that only ever changes by being
  // re-exported, and Vercel serves those with `max-age=0, must-revalidate` by
  // default — so every repeat visitor re-requests all ~16 of them on every page
  // load. These headers are also the "upstream Cache-Control" half of the
  // optimizer's TTL rule described on `minimumCacheTTL` above, so they keep it
  // from re-encoding the multi-megabyte envelope/RSVP PNGs on a short cycle.
  //
  // 30 days rather than a year + `immutable`, because these are still being
  // iterated on. When you replace an asset in place, bump a `?v=` on the
  // reference (components/letter/our-story.tsx already does this for the lace
  // mask) — statically imported images are content-hashed and need no bump.
  //
  // `stale-while-revalidate` means the day-31 request is served from the stale
  // copy while the refresh happens in the background, rather than blocking the
  // paint on a revalidation round trip.
  async headers() {
    const cache = [
      {
        key: 'Cache-Control',
        value: 'public, max-age=2592000, stale-while-revalidate=86400',
      },
    ];

    // Root-level artwork by extension. The character class is deliberate: a
    // custom header REPLACES the one Next.js sets, and a bare `(.*)` also
    // matches `/_next/static/media/lace.<hash>.png`, so the old
    // `/:file(.*).png` rule was silently downgrading content-hashed assets
    // from Next's own `max-age=31536000, immutable` to 30 days — i.e. the
    // assets that are safest to cache forever were getting the weakest
    // policy. `[^/]+` keeps each rule to a single path segment, so nothing
    // under `/_next/` is touched. Do not widen these to `(.*)`.
    const rootFile = (ext: string) => ({
      source: `/:file([^/]+\\.${ext})`,
      headers: cache,
    });

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
      rootFile('png'),
      rootFile('jpg'),
      rootFile('svg'),
      rootFile('webp'),
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
