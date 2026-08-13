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
