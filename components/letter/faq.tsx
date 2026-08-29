'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { SectionHeading } from '@/components/letter/section-heading';

/**
 * FAQ — white section after Gifts (last in the letter). Same header pattern as
 * the other sections (SectionHeading), then a stack of
 * question/answer rows, separated by ink rules so the final section feels like
 * part of the letter rather than a separate UI surface. Placeholder copy — edit freely.
 */
const FAQS = [
  {
    id: 'plus-one',
    q: 'Can I bring a plus-one?',
    a: 'Seats are reserved for the names on your invite. If your invite includes extra seats, you’ll see them when you RSVP — otherwise we’re keeping it intimate.',
  },
  {
    id: 'kids',
    q: 'Are kids welcome?',
    a: 'We love your little ones. When you RSVP you can let us know how many children are coming so we can plan seating and food.',
  },
  {
    id: 'rsvp-deadline',
    q: 'When should I RSVP by?',
    a: 'Please reply as early as you can so we can finalise numbers with the venue. If your plans change afterwards, just reach out to us directly.',
  },
];

export function Faq() {
  const [openFaqIds, setOpenFaqIds] = useState<string[]>([]);
  const reduceMotion = !!useReducedMotion();
  const answerTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <section className="bg-paper px-gutter py-section">
      <div className="mx-auto max-w-[56rem] text-center">
        <SectionHeading title="Good to know" kicker="FAQ" />

        <div className="mx-auto mt-heading max-w-2xl border-y border-ink text-left">
          {FAQS.map((f) => (
            <div key={f.id} className="border-b border-ink last:border-b-0">
              <h3>
                <button
                  type="button"
                  aria-controls={`faq-answer-${f.id}`}
                  aria-expanded={openFaqIds.includes(f.id)}
                  onClick={() =>
                    setOpenFaqIds((current) =>
                      current.includes(f.id)
                        ? current.filter((id) => id !== f.id)
                        : [...current, f.id],
                    )
                  }
                  className="group flex min-h-18 w-full items-center justify-between gap-5 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                >
                  <span
                    id={`faq-question-${f.id}`}
                    className="font-sans text-subhead decoration-1 underline-offset-4 transition group-hover:underline"
                  >
                    {f.q}
                  </span>
                  <ChevronDown
                    aria-hidden
                    className="size-5 shrink-0 transition duration-200 group-aria-expanded:rotate-180 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {openFaqIds.includes(f.id) ? (
                  <motion.div
                    id={`faq-answer-${f.id}`}
                    role="region"
                    aria-labelledby={`faq-question-${f.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={answerTransition}
                    className="overflow-hidden"
                  >
                    <div className="max-w-xl pb-7 pr-10 text-body sm:pl-10">
                      <p>{f.a}</p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
