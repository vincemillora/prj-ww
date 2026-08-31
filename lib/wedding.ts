/**
 * Couple + occasion — the single source for the couple's names and wedding
 * date, shared by the dashboard header, the countdown, and the guest-facing
 * wedding letter (components/letter/wedding-letter.tsx).
 *
 * The names are the couple's shared display names. The date is the single source of truth for the
 * countdown (hero + dashboard) — change it here and both update.
 */
export const COUPLE = 'Vince & Kc';

/** Individual names, for prose that speaks about one of the couple. */
export const COUPLE_NAMES = COUPLE.split(' & ') as [string, string];

export const WEDDING_DATE_ISO = '2027-04-10T00:00:00';

const WEDDING_DATE = new Date(WEDDING_DATE_ISO);

/** "April 2027" — the hero line under the couple's names. */
export const WEDDING_MONTH_LABEL = WEDDING_DATE.toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric',
});

/** "April 2027" — the date anchor in the countdown band. */
export const WEDDING_DAY_LABEL = WEDDING_DATE.toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric',
});

/**
 * When we hope to hear back — the note under the RSVP card. Kept here with the
 * rest of the occasion's dates rather than inline in the section, so the
 * deadline is stated in one place.
 */
export const RSVP_DEADLINE_LABEL = 'December 2026';

/** Venue name — shared by the Location section and the calendar event. */
export const WEDDING_VENUE = 'Anvy Beach Resort';

/**
 * The event behind the letter's "Add to calendar" button.
 *
 * The day is WEDDING_DATE_ISO's date, so moving the wedding here moves the
 * calendar entry with everything else. The times are the guest-facing day from
 * components/letter/day-itself.tsx (guests arrive 2:00 pm, fireworks 10:00 pm)
 * written with an explicit +08:00 offset — the venue's own time zone — so the
 * event lands at the right hour no matter where the guest's device is set.
 */
export const WEDDING_EVENT = {
  title: `${COUPLE} — Wedding`,
  location: WEDDING_VENUE,
  details: 'We would be honoured to have you celebrate with us.',
  start: `${WEDDING_DATE_ISO.slice(0, 10)}T14:00:00+08:00`,
  end: `${WEDDING_DATE_ISO.slice(0, 10)}T23:00:00+08:00`,
} as const;

/**
 * Seven days centered on the wedding day (±3 days), for the hero's calendar
 * strip. Derived from WEDDING_DATE_ISO so a date change moves the whole strip
 * and the circled day together.
 */
export const WEDDING_WEEK = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(WEDDING_DATE);
  d.setDate(WEDDING_DATE.getDate() - 3 + i);
  return {
    label: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    date: d.getDate(),
    isWeddingDay: d.getTime() === WEDDING_DATE.getTime(),
  };
});
