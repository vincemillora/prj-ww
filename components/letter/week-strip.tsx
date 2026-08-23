import { Fragment } from 'react';

import { cn } from '@/lib/utils';
import { WEDDING_WEEK } from '@/lib/wedding';

/**
 * The wedding week as a row of weekday/date pairs, with the day itself ringed.
 * Everything is drawn in `currentColor` — the separator dots, the ring and both
 * lines of type — so the caller sets the colour: white over the Hero's photo,
 * ink on antique-linen paper.
 *
 * It opens the page under "are getting married!" in the Hero (it used to sit in
 * the countdown band).
 *
 * On a phone the two outermost days are dropped, leaving five — the wedding day
 * sits dead centre of the week, so trimming both ends keeps it centred and buys
 * room for wider gaps. The separator dot that would be left dangling beside a
 * hidden day is hidden with it.
 */
export function WeekStrip({ className }: { className?: string }) {
  const lastIndex = WEDDING_WEEK.length - 1;
  const isEdge = (i: number) => i === 0 || i === lastIndex;

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {WEDDING_WEEK.map((d, i) => (
        <Fragment key={d.label}>
          {i > 0 ? (
            <span
              aria-hidden
              className={cn(
                // 24px between days on a phone, up from 20. The five visible
                // cells are 36px each, so the row measures 276px — still inside
                // the 280px a 320px screen leaves after the gutter, which is
                // what caps this: mx-4 overflows there.
                'mx-3 size-[3px] shrink-0 rounded-full bg-current sm:mx-6',
                (isEdge(i) || isEdge(i - 1)) && 'hidden sm:block'
              )}
            />
          ) : null}
          <span
            className={cn(
              'relative flex w-9 flex-col items-center gap-1 py-0.5 sm:w-10',
              isEdge(i) && 'hidden sm:flex'
            )}
          >
            {d.isWeddingDay ? (
              <svg
                viewBox="0 0 64 64"
                preserveAspectRatio="none"
                aria-hidden
                className="pointer-events-none absolute -inset-x-2 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)]"
              >
                {/* Fine closed ellipse — a calm, calligraphic ring around the
                    day rather than a scribbled circle. */}
                <ellipse
                  cx="32"
                  cy="32"
                  rx="29.5"
                  ry="29.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  opacity="0.85"
                />
              </svg>
            ) : null}
            <span className="font-sans text-micro leading-none tracking-[0.14em]">
              {d.label}
            </span>
            <span
              className={cn(
                'font-sans text-meta leading-none',
                d.isWeddingDay && 'font-medium'
              )}
            >
              {d.date}
            </span>
          </span>
        </Fragment>

      ))}
    </div>
  );
}
