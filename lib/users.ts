import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { users, type User } from '@/db/schema';
import type { GoogleProfile } from '@/lib/oauth';

type BootstrapUserRow = Omit<User, 'createdAt' | 'lastLoginAt'> & {
  createdAt: string | Date;
  lastLoginAt: string | Date | null;
};

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

/**
 * Refresh an existing admin's profile on login, or bootstrap the first user.
 *
 * Admins are **not** self-provisioned once the system is seeded. Sign-in only
 * authenticates a user that already exists in `users`, matched by their stable
 * Google `sub`; an unknown account returns `null` and is denied by the callback.
 *
 * **Bootstrap exception:** while `users` is completely empty, the first Google
 * account to sign in is provisioned as the `superadmin` (active). This is the
 * one self-provisioning path and it closes permanently the instant any row
 * exists — every later unknown account is denied as before. A single
 * conditional insert handles the bootstrap atomically, and the partial unique
 * index `one_superadmin_idx` guarantees a concurrent second login cannot
 * create a second superadmin.
 *
 * For a matched user the profile fields and `lastLoginAt` are refreshed; the
 * existing `role` and `status` are left untouched.
 */
export async function updateUserOnLogin(profile: GoogleProfile): Promise<User | null> {
  const [row] = await db
    .update(users)
    .set({
      email: profile.email,
      name: profile.name ?? null,
      picture: profile.picture ?? null,
      lastLoginAt: sql`now()`,
    })
    .where(eq(users.googleSub, profile.sub))
    .returning();
  if (row) return row;

  // Bootstrap: first-ever sign-in becomes the superadmin. This stays on the
  // Neon HTTP driver by using one atomic conditional insert rather than an
  // interactive transaction. ON CONFLICT turns a concurrent bootstrap attempt
  // into a normal denied login.
  const bootstrap = await db.execute<BootstrapUserRow>(sql`
    insert into ${users} (
      ${users.googleSub},
      ${users.email},
      ${users.name},
      ${users.picture},
      ${users.role},
      ${users.status},
      ${users.lastLoginAt}
    )
    select
      ${profile.sub},
      ${profile.email},
      ${profile.name ?? null},
      ${profile.picture ?? null},
      'superadmin',
      'active',
      now()
    where not exists (select 1 from ${users})
    on conflict do nothing
    returning
      ${users.id} as "id",
      ${users.googleSub} as "googleSub",
      ${users.email} as "email",
      ${users.name} as "name",
      ${users.picture} as "picture",
      ${users.role} as "role",
      ${users.status} as "status",
      ${users.createdAt} as "createdAt",
      ${users.lastLoginAt} as "lastLoginAt"
  `);
  const created = bootstrap.rows[0];
  if (!created) return null;

  return {
    ...created,
    createdAt: toDate(created.createdAt),
    lastLoginAt: created.lastLoginAt ? toDate(created.lastLoginAt) : null,
  };
}
