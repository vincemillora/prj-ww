'use client';

import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * "Lifetime" (Ben&Ben), piano cover by Marky J — public/music/lifetime-piano.mp3.
 *
 * MP3 at 64kbps, 3.0MB: it replaces a 1.1MB synthesized placeholder loop, so
 * the page is heavier than before. `preload="none"` on the element below is
 * what keeps that off the critical path — nothing is fetched until the guest
 * presses play, so the hero and the RSVP form never compete with it.
 */
const TRACK_SRC = '/music/lifetime-piano.mp3';

/**
 * A vinyl record that spins while a looping track plays and stops when paused.
 * Browsers block autoplay-with-sound, so playback is click-to-toggle.
 *
 * The invitation to press play is set around the record rather than under it:
 * the phrase runs twice round a circle just outside the wax, the way a title
 * runs round a record label. It is a decorative echo of the button's own
 * `aria-label`, so it is hidden from assistive tech, and it stays still while
 * the disc turns underneath it.
 *
 * Styling lives in app/globals.css (`.vinyl-ring` / `.vinyl`): grooved wax, a
 * paper label, and the same drop shadow as `.env-back`. Inside `.letter-theme`
 * the record is re-pressed in `--ink` to keep the letter's two colours.
 * The component brings no outer spacing of its own — callers place it with
 * `className`, and `size` sets the disc's width (`--vinyl-size`).
 *
 * It opened the retired envelope intro; it now sits over the countdown band.
 */
export function VinylPlayer({
  className,
  size = 'min(64vw, 300px)',
}: {
  className?: string;
  /** Any CSS width — becomes `--vinyl-size` on the record. */
  size?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      // Play can reject if the gesture isn't trusted; stay paused.
      setPlaying(false);
    }
  };

  return (
    <div
      className={cn('vinyl-ring', className)}
      style={{ '--vinyl-size': size } as React.CSSProperties}
    >
      <button
        type="button"
        className={cn('vinyl', playing && 'is-spinning')}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? 'Pause background music' : 'Play background music'}
        title={playing ? 'Pause music' : 'Play music'}
      >
        <span className="vinyl-label" aria-hidden />
        <span className="vinyl-hole" aria-hidden />
      </button>
      {/* Play/pause glyph over the record's centre. Kept OUT of the spinning
          button so it stays upright while the disc turns; pointer-events pass
          through to the button beneath. */}
      <span className="vinyl-icon" aria-hidden>
        {playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
      </span>
      <audio ref={audioRef} src={TRACK_SRC} loop preload="none" />
    </div>
  );
}
