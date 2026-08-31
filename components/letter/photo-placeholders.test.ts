// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), 'utf8');

describe('temporary photo spaces', () => {
  it('keeps every active letter photo surface free of remote placeholder images', () => {
    const activePhotoSources = [
      'components/letter/countdown-locket.tsx',
      'components/letter/envelope-gallery.tsx',
      'components/letter/location.tsx',
      'components/letter/our-story/memories.ts',
      'components/letter/prenup.tsx',
      'next.config.ts',
    ];
    const removedHost = ['pic', 'sum'].join('') + '.photos';

    for (const path of activePhotoSources) {
      expect(source(path), path).not.toContain(removedHost);
    }
  });
});
