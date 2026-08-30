'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type IdleDeadlineLike = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: (deadline: IdleDeadlineLike) => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

type DeferredMapProps = {
  active: boolean;
  src: string;
  title: string;
};

/** Reserves the map card while moving iframe creation out of active scrolling. */
export function DeferredMap({ active, src, title }: DeferredMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;

    const container = containerRef.current;
    if (!container) return;

    const idleWindow = window as IdleWindow;
    let cancelled = false;
    let idleHandle: number | undefined;
    let timerHandle: number | undefined;

    const mount = () => {
      if (!cancelled) setMounted(true);
    };
    const scheduleMount = () => {
      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(mount, { timeout: 800 });
      } else {
        timerHandle = window.setTimeout(mount, 150);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        scheduleMount();
      },
      { rootMargin: '1200px 0px' },
    );
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (idleHandle !== undefined) {
        idleWindow.cancelIdleCallback?.(idleHandle);
      }
      if (timerHandle !== undefined) window.clearTimeout(timerHandle);
    };
  }, [mounted]);

  return (
    <div
      ref={containerRef}
      className="mt-4 h-[20rem] overflow-hidden rounded-md border border-ink/15 md:h-[24rem]"
    >
      {mounted ? (
        <iframe
          title={title}
          src={src}
          className={cn(
            'block size-full border-0',
            !active && 'pointer-events-none',
          )}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : null}
    </div>
  );
}
