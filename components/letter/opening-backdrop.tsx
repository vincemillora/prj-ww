'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import heroLily from '@/public/hero-lily.jpg';
import { Hero } from '@/components/letter/hero';

/**
 * The hero's scroll-zoom scene. The photo is the only animated layer; the
 * lace remains in Hero's separate sticky layer above it.
 */
export function OpeningBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 1.15]);
  const blurOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <div ref={ref} className="relative h-[150svh] bg-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-dvh overflow-hidden">
          <motion.div className="absolute inset-0" style={{ scale }}>
            <Image
              data-slot="hero-background-sharp"
              src={heroLily}
              alt=""
              fill
              preload
              placeholder="blur"
              sizes="100vw"
              className="object-cover object-center"
            />
            <motion.div
              data-slot="hero-background-blur"
              className="absolute inset-0 blur-[8px]"
              style={{ opacity: blurOpacity }}
            >
              <Image
                src={heroLily}
                alt=""
                fill
                loading="eager"
                placeholder="blur"
                sizes="100vw"
                className="object-cover object-center"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
      <Hero />
    </div>
  );
}
