'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Tag, Trash2 } from 'lucide-react';
import type { Label as LabelRow } from '@/db/schema';
import { createLabel, renameLabel, deleteLabel, type ActionState } from './actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field, FieldError } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';

const INITIAL: ActionState = { ok: false };

export function LabelsManager({
  labels,
  open,
  onOpenChange,
  trigger = true,
}: {
  labels: LabelRow[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <DialogTrigger
          render={
            <Button variant="outline" size="sm">
              <Tag data-icon="inline-start" /> Labels
            </Button>
          }
        />
      ) : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage labels</DialogTitle>
          <DialogDescription>
            Tags you can attach to guests (e.g. “Bride’s family”, “College friends”).
          </DialogDescription>
        </DialogHeader>
        <AddLabelForm />
        <div className="flex flex-col divide-y">
          {labels.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">No labels yet.</p>
          ) : (
            labels.map((l) => <LabelRowItem key={l.id} label={l} />)
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddLabelForm() {
  const [state, action, pending] = useActionState(createLabel, INITIAL);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action}>
      <Field className="gap-1" data-invalid={Boolean(state.fieldErrors?.name)}>
        <div className="flex items-center gap-2">
          <Input
            name="name"
            placeholder="New label…"
            maxLength={40}
            className="flex-1"
            aria-invalid={Boolean(state.fieldErrors?.name)}
          />
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Add
          </Button>
        </div>
        <FieldError className="text-xs">{state.fieldErrors?.name}</FieldError>
      </Field>
    </form>
  );
}

function LabelRowItem({ label }: { label: LabelRow }) {
  const [state, action, pending] = useActionState(renameLabel, INITIAL);
  return (
    <div className="flex flex-col gap-1 py-2">
      <div className="flex items-center gap-2">
        <form action={action} className="flex flex-1 items-center gap-2">
          <input type="hidden" name="labelId" value={label.id} />
          <Input name="name" defaultValue={label.name} maxLength={40} className="flex-1" />
          <Button type="submit" variant="outline" size="sm" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Save
          </Button>
        </form>
        <form action={deleteLabel}>
          <input type="hidden" name="labelId" value={label.id} />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${label.name}`}
          >
            <Trash2 />
          </Button>
        </form>
      </div>
      {state.fieldErrors?.name ? (
        <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
      ) : null}
    </div>
  );
}
