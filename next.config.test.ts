// @vitest-environment node
import { describe, expect, it } from 'vitest';

import nextConfig from './next.config';

async function headerRules() {
  const rules = await nextConfig.headers!();
  return rules as { source: string; headers: { key: string; value: string }[] }[];
}

/**
 * Guards the asset cache policy in `next.config.ts`.
 *
 * A custom `headers()` entry REPLACES the `Cache-Control` Next.js sets itself,
 * and everything content-hashed lives under `/_next/static/` where Next already
 * sends `max-age=31536000, immutable`. A rule written as `/:file(.*).png` also
 * matches `/_next/static/media/lace.<hash>.png`, so it silently downgrades the
 * assets that are safest to cache forever down to the `/public` policy. That
 * regression shipped once and is invisible without inspecting live response
 * headers, so the invariant is pinned here.
 */
describe('asset cache headers', () => {
  it('keeps every root-level extension rule inside a single path segment', async () => {
    for (const rule of await headerRules()) {
      // `(.*)` crosses `/`, which is what lets a rule reach into /_next/static.
      // Extension rules must use `[^/]+`; directory rules use `:path*` under an
      // explicit /public prefix, which can never resolve to /_next.
      expect(rule.source, `rule "${rule.source}" spans path segments`).not.toContain('(.*)');
    }
  });

  it('never scopes a rule to /_next, where Next.js owns the policy', async () => {
    for (const rule of await headerRules()) {
      expect(rule.source).not.toContain('_next');
    }
  });

  it('caches each /public asset directory', async () => {
    const sources = (await headerRules()).map((rule) => rule.source);

    for (const dir of ['icons', 'florals', 'laces', 'envelope', 'locket', 'music']) {
      expect(sources).toContain(`/${dir}/:path*`);
    }
  });

  it('caches root-level artwork by extension, plus the favicon', async () => {
    const sources = (await headerRules()).map((rule) => rule.source);

    for (const ext of ['png', 'jpg', 'svg', 'webp']) {
      expect(sources).toContain(`/:file([^/]+\\.${ext})`);
    }
    expect(sources).toContain('/favicon.ico');
  });

  it('sends a shared, month-long, non-blocking policy on every rule', async () => {
    for (const rule of await headerRules()) {
      const cacheControl = rule.headers.find((h) => h.key === 'Cache-Control');

      expect(cacheControl?.value).toBe(
        'public, max-age=2592000, stale-while-revalidate=86400',
      );
    }
  });

  it('holds optimized image variants at least as long as their source asset', async () => {
    // The optimizer's max-age is max(minimumCacheTTL, upstream Cache-Control),
    // so a floor below the /public max-age would only ever be shadowed by it —
    // and would leave remote images, whose headers we don't control, on the
    // 4-hour default.
    expect(nextConfig.images?.minimumCacheTTL).toBe(2592000);
  });
});
