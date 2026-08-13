'use client';

import { useActionState, useEffect, useState, type ReactNode } from 'react';
import { Check, Pencil, Plus } from 'lucide-react';
import type { Label as LabelRow } from '@/db/schema';
import { SNS_PLATFORMS, SNS_CONFIG } from '@/lib/sns';
import { SnsIcon } from '@/components/dashboard/sns-icon';
import { createGuest, updateGuest, type ActionState } from './actions';
import {
  getGuestPartyState,
  STATUS_LABEL,
  STATUS_OPTIONS,
  type GuestData,
  type GuestFormMode,
  type RsvpStatus,
} from './guest-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const INITIAL: ActionState = { ok: false };
const STATUS_ITEMS = STATUS_OPTIONS.map((value) => ({
  value,
  label: STATUS_LABEL[value],
}));

export function GuestDialog({
  mode,
  labels,
  guest,
}: {
  mode: GuestFormMode;
  labels: LabelRow[];
  guest?: GuestData;
}) {
  const [open, setOpen] = useState(false);
  // Bump the key on each open so the inner form (and its useActionState) remounts fresh.
  const [instance, setInstance] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setInstance((n) => n + 1);
      }}
    >
      <DialogTrigger
        render={
          mode === 'create' ? (
            <Button className="shadow-[0_4px_14px_rgba(138,118,176,0.32)]">
              <Plus data-icon="inline-start" /> Add guest
            </Button>
          ) : (
            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${guest?.name ?? ''}`}>
              <Pencil />
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <GuestForm
          key={instance}
          mode={mode}
          labels={labels}
          guest={guest}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function GuestForm({
  mode,
  labels,
  guest,
  onDone,
}: {
  mode: GuestFormMode;
  labels: LabelRow[];
  guest?: GuestData;
  onDone: () => void;
}) {
  const action = mode === 'create' ? createGuest : updateGuest;
  const [state, formAction, pending] = useActionState(action, INITIAL);

  // Controlled copies of the fields the live party-size math depends on.
  // The server re-checks the same rules in guestCreateSchema/guestUpdateSchema.
  const [status, setStatus] = useState<RsvpStatus>(guest?.status ?? 'pending');
  const [maxGuests, setMaxGuests] = useState(String(guest?.maxGuests ?? 1));
  const [adults, setAdults] = useState(guest?.adults != null ? String(guest.adults) : '');
  const [kids, setKids] = useState(guest?.kids != null ? String(guest.kids) : '');
  const [labelIds, setLabelIds] = useState<string[]>(guest?.labelIds ?? []);

  const { declined, hasCounts, partySize, seats, partyError } = getGuestPartyState({
    mode,
    status,
    maxGuests,
    adults,
    kids,
    serverError: state.fieldErrors?.partySize,
  });

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Add guest' : 'Edit guest'}</DialogTitle>
        <DialogDescription>
          {mode === 'create'
            ? 'Create an invitee and generate their personal RSVP link.'
            : 'Update this invitee.'}
        </DialogDescription>
      </DialogHeader>
      <form action={formAction} className="flex flex-col gap-5">
        {mode === 'edit' && guest ? (
          <input type="hidden" name="guestId" value={guest.id} />
        ) : null}
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

        <Section title="Guest details">
          <GuestField label="Name" error={state.fieldErrors?.name}>
            <Input name="name" defaultValue={guest?.name ?? ''} maxLength={120} required autoFocus />
          </GuestField>
          <GuestField
            label="Max guests"
            hint="Seats reserved for this party — the most people their link can bring."
            error={state.fieldErrors?.maxGuests}
          >
            <Input
              name="maxGuests"
              type="number"
              min={1}
              max={20}
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
            />
          </GuestField>
        </Section>

        <Section title={mode === 'create' ? 'Party count' : 'RSVP reply'}>
          {mode === 'edit' ? (
            <GuestField label="Status">
              <Select
                items={STATUS_ITEMS}
                name="status"
                value={status}
                onValueChange={(v) => setStatus(v as RsvpStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) => STATUS_LABEL[value as RsvpStatus] ?? 'Pending'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STATUS_ITEMS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </GuestField>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <GuestField label="Adults" error={state.fieldErrors?.adults}>
              <Input
                name="adults"
                type="number"
                min={0}
                max={20}
                placeholder="—"
                value={declined ? '0' : adults}
                onChange={(e) => setAdults(e.target.value)}
                disabled={declined}
              />
            </GuestField>
            <GuestField label="Kids" error={state.fieldErrors?.kids}>
              <Input
                name="kids"
                type="number"
                min={0}
                max={20}
                placeholder="—"
                value={declined ? '0' : kids}
                onChange={(e) => setKids(e.target.value)}
                disabled={declined}
              />
            </GuestField>
          </div>
          {partyError ? (
            <p className="text-xs text-destructive">{partyError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {declined
                ? 'Declined — the party count is cleared to 0 on save.'
                : hasCounts
                  ? `Party size ${partySize} of ${seats} seat${seats === 1 ? '' : 's'} (adults + kids).`
                  : mode === 'create'
                    ? 'Pre-fill the expected head-count, or leave blank.'
                    : 'No reply yet — leave blank until the party responds.'}
            </p>
          )}
        </Section>

        <Section title="Contact">
          <div className="grid grid-cols-2 gap-3">
            <GuestField label="Email" error={state.fieldErrors?.email}>
              <Input name="email" type="email" defaultValue={guest?.email ?? ''} />
            </GuestField>
            <GuestField label="Phone" error={state.fieldErrors?.phone}>
              <Input name="phone" defaultValue={guest?.phone ?? ''} />
            </GuestField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SNS_PLATFORMS.map((p) => {
              const cfg = SNS_CONFIG[p];
              return (
                <GuestField key={p} label={cfg.label}>
                  <InputGroup>
                    <InputGroupInput
                      name={`sns_${p}`}
                      defaultValue={guest?.snsAccounts?.[p] ?? ''}
                      placeholder="username"
                      maxLength={100}
                    />
                    <InputGroupAddon align="inline-start">
                      <InputGroupText className="text-xs">
                        <SnsIcon platform={p} />
                        {cfg.prefix}
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </GuestField>
              );
            })}
          </div>
        </Section>

        {labels.length > 0 ? (
          <Section title="Labels">
            <div className="flex flex-wrap gap-1.5">
              {labels.map((l) => {
                const on = labelIds.includes(l.id);
                return (
                  <Badge
                    key={l.id}
                    variant={on ? 'default' : 'outline'}
                    className="h-6 cursor-pointer px-2.5"
                    render={
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          setLabelIds((prev) =>
                            on ? prev.filter((id) => id !== l.id) : [...prev, l.id],
                          )
                        }
                      >
                        {on ? <Check /> : <Plus />}
                        {l.name}
                      </button>
                    }
                  />
                );
              })}
            </div>
            {labelIds.map((id) => (
              <input key={id} type="hidden" name="labelIds" value={id} />
            ))}
          </Section>
        ) : null}

        <Section title="Notes">
          <GuestField label="Admin note" error={state.fieldErrors?.adminNote}>
            <Textarea
              name="adminNote"
              defaultValue={guest?.adminNote ?? ''}
              rows={2}
              placeholder="Private — only you see this"
            />
          </GuestField>
        </Section>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? 'Saving…' : mode === 'create' ? 'Add guest' : 'Save changes'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-[10.5px] font-semibold tracking-wider text-muted-foreground uppercase">
          {title}
        </span>
        <Separator className="flex-1" />
      </div>
      <FieldGroup className="gap-3">{children}</FieldGroup>
    </div>
  );
}

function GuestField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <Field className="gap-1.5" data-invalid={Boolean(error)}>
      <FieldLabel>{label}</FieldLabel>
      {children}
      {error ? (
        <FieldError className="text-xs">{error}</FieldError>
      ) : hint ? (
        <FieldDescription className="text-xs">{hint}</FieldDescription>
      ) : null}
    </Field>
  );
}
