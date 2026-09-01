# Countdown Locket Design

## Goal

Add the supplied ribbon and locket artwork to the guest letter's countdown band, with two temporary prenup-style photographs visible inside the locket.

## Composition

- Place a decorative, non-interactive locket group above the existing `counting down to the day` line.
- Center the group so the ribbon leads the eye down into the open locket; keep the existing countdown copy and calendar action unchanged.
- Render the supplied ribbon asset behind the locket and the supplied locket asset as the visible frame.
- Keep the locket's two temporary photo windows visible, matching the placeholder approach used by the prenup gallery.
- Treat all three visuals as decorative (`alt=""`, `aria-hidden`) because the countdown's text remains the meaning-bearing content.

## Responsive and Motion Behavior

- Size the group from a single fluid width that remains compact above the countdown on a 360px phone and gains presence on larger screens.
- Reserve its layout height so image loading cannot move the heading or countdown.
- Keep it within the countdown band's existing reveal; reduced-motion visitors receive the fully visible static composition.

## Implementation Boundary

- Modify `components/letter/countdown-band.tsx` and add one focused locket presentation component under `components/letter/`.
- Reuse the supplied public assets and existing letter tokens. Do not change dashboard surfaces, countdown timing, section order, typography roles, or the RSVP spec because no product/data decision changes.

## Verification

- Add a component-level regression test that verifies the decorative locket group renders both asset paths and both seeded image URLs before the countdown heading.
- Run the focused test, type-check/lint, and inspect the public page at mobile and desktop widths.
