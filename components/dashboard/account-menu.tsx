"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, ShieldCheck, Tag } from "lucide-react";
import type { Label as LabelRow } from "@/db/schema";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LabelsManager } from "@/app/(protected)/dashboard/guests/labels-manager";

type AccountUser = {
  name: string | null;
  email: string;
  role: string;
  picture: string | null;
};

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  const letters =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Header account chip (avatar + name + email) with a dropdown for label
 * management, the superadmin Users link, and sign-out — replaces the old
 * sidebar. The logout form sits outside the menu so a menu item can submit it.
 */
export function AccountMenu({
  user,
  labels,
}: {
  user: AccountUser;
  labels: LabelRow[];
}) {
  const [labelsOpen, setLabelsOpen] = useState(false);

  return (
    <>
      <form id="logout-form" action="/api/auth/logout" method="post" className="hidden" />
      <LabelsManager
        labels={labels}
        open={labelsOpen}
        onOpenChange={setLabelsOpen}
        trigger={false}
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label="Account menu"
              className="flex items-center gap-2.5 rounded-full border bg-card p-[3px] text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none sm:py-[5px] sm:pr-3.5 sm:pl-[5px]"
            >
              <Avatar className="size-8">
                {user.picture ? (
                  <AvatarImage src={user.picture} alt={user.name ?? user.email} />
                ) : null}
                <AvatarFallback className="bg-[#ece6f3] text-xs font-semibold text-[#6f5b95]">
                  {initials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-40 flex-col leading-tight sm:flex">
                <span className="truncate text-[12.5px] font-semibold text-foreground">
                  {user.name ?? "Admin"}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {user.email}
                </span>
              </span>
              <ChevronDown className="hidden size-3 text-muted-foreground sm:block" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
              <Avatar className="size-9">
                {user.picture ? (
                  <AvatarImage src={user.picture} alt={user.name ?? user.email} />
                ) : null}
                <AvatarFallback className="bg-[#ece6f3] text-sm font-semibold text-[#6f5b95]">
                  {initials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-semibold text-foreground">
                  {user.name ?? "Admin"}
                </span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {user.role !== "viewer" ? (
              <DropdownMenuItem onClick={() => setLabelsOpen(true)}>
                <Tag />
                Manage labels
              </DropdownMenuItem>
            ) : null}
            {user.role === "superadmin" ? (
              <DropdownMenuItem render={<Link href="/dashboard/users" />}>
                <ShieldCheck />
                Manage users
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              variant="destructive"
              render={<button type="submit" form="logout-form" />}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
