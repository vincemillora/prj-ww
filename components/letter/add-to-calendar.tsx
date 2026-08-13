"use client";

import { useState } from "react";
import { CalendarPlus, ChevronDown } from "lucide-react";

import {
  letterButton,
  type LetterButtonVariants,
} from "@/components/letter/letter-button";
import { cn } from "@/lib/utils";

type CalendarMenuModule = typeof import("@/components/letter/calendar-menu");
type CalendarMenuComponent = CalendarMenuModule["CalendarMenu"];

let menuModule: Promise<CalendarMenuModule> | undefined;

function loadCalendarMenu() {
  return (menuModule ??= import("@/components/letter/calendar-menu"));
}

export function AddToCalendar({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: LetterButtonVariants["variant"];
}) {
  const [Menu, setMenu] = useState<CalendarMenuComponent | null>(null);
  const [open, setOpen] = useState(false);

  const preload = () => {
    void loadCalendarMenu();
  };

  const showMenu = async () => {
    setOpen(true);
    const { CalendarMenu } = await loadCalendarMenu();
    setMenu(() => CalendarMenu);
  };

  if (Menu) {
    return (
      <Menu
        className={className}
        variant={variant}
        open={open}
        onOpenChange={setOpen}
      />
    );
  }

  return (
    <button
      type="button"
      className={cn(letterButton({ variant }), className)}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-busy={open}
      onPointerEnter={preload}
      onFocus={preload}
      onClick={showMenu}
    >
      <CalendarPlus aria-hidden strokeWidth={1.5} />
      Add to calendar
      <ChevronDown aria-hidden strokeWidth={1.5} />
    </button>
  );
}
