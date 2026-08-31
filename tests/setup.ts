import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

/**
 * jsdom ships no IntersectionObserver, and motion's `whileInView` THROWS
 * without one rather than degrading. Several letter sections reveal on scroll,
 * so this stub stands in for it.
 *
 * It reports the target as fully intersecting on the next tick, which is the
 * useful default under test: a component's revealed state is the one worth
 * asserting against, and a stub that never fires would leave every reveal stuck
 * at opacity 0 and hide real regressions behind an animation that never ran.
 */
class ImmediateIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [0];

  #callback: IntersectionObserverCallback;
  #targets = new Set<Element>();

  constructor(callback: IntersectionObserverCallback) {
    this.#callback = callback;
  }

  observe(target: Element) {
    this.#targets.add(target);
    queueMicrotask(() => {
      if (!this.#targets.has(target)) return;
      this.#callback(
        [
          {
            target,
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: target.getBoundingClientRect(),
            intersectionRect: target.getBoundingClientRect(),
            rootBounds: null,
            time: 0,
          } as IntersectionObserverEntry,
        ],
        this,
      );
    });
  }

  unobserve(target: Element) {
    this.#targets.delete(target);
  }

  disconnect() {
    this.#targets.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

globalThis.IntersectionObserver =
  ImmediateIntersectionObserver as unknown as typeof IntersectionObserver;
