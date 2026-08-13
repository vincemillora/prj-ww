'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Copies the guest's personal RSVP link. Uses APP_URL (the real domain) when
 * provided; otherwise falls back to the current origin so it still works in dev.
 */
export function CopyLinkButton({ token, baseUrl }: { token: string; baseUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const base = baseUrl || window.location.origin;
    const url = `${base}/?id=${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (e.g. insecure context) — no-op.
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={copy}
      aria-label={copied ? 'Invite link copied' : 'Copy invite link'}
      title="Copy invite link"
    >
      {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
    </Button>
  );
}
