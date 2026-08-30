import { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  execute: vi.fn(),
  insert: vi.fn(),
  insertSelect: vi.fn(),
  returning: vi.fn(),
  select: vi.fn(),
  transaction: vi.fn(),
  update: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({
  db: dbMocks,
}));

import { updateUserOnLogin } from "@/lib/users";

const profile = {
  sub: "google-sub",
  email: "admin@example.com",
  emailVerified: true,
  name: "Admin",
  picture: "https://example.com/admin.jpg",
};

const createdAt = new Date("2026-08-30T00:00:00.000Z");
const lastLoginAt = new Date("2026-08-30T00:01:00.000Z");
const bootstrapUser = {
  id: "1eac86f8-3224-4538-bf44-68590b376aef",
  googleSub: profile.sub,
  email: profile.email,
  name: profile.name,
  picture: profile.picture,
  role: "superadmin" as const,
  status: "active" as const,
  createdAt,
  lastLoginAt,
};

describe("updateUserOnLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.update.mockReturnValue({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([]),
        }),
      }),
    });
    dbMocks.execute.mockResolvedValue({
      rows: [
        {
          ...bootstrapUser,
          createdAt: createdAt.toISOString(),
          lastLoginAt: lastLoginAt.toISOString(),
        },
      ],
    });
    dbMocks.select.mockReturnValue({
      from: () => ({ where: () => ({}) }),
    });
    dbMocks.insert.mockReturnValue({
      select: dbMocks.insertSelect,
    });
    dbMocks.insertSelect.mockReturnValue({
      onConflictDoNothing: () => ({
        returning: dbMocks.returning,
      }),
    });
    dbMocks.returning.mockResolvedValue([bootstrapUser]);
    dbMocks.transaction.mockRejectedValue(
      new Error("No transactions support in neon-http driver"),
    );
  });

  it("bootstraps the first admin without an interactive transaction", async () => {
    await expect(updateUserOnLogin(profile)).resolves.toMatchObject({
      googleSub: profile.sub,
      role: "superadmin",
      status: "active",
    });

    expect(dbMocks.execute).toHaveBeenCalledOnce();
    expect(dbMocks.insert).not.toHaveBeenCalled();
    expect(dbMocks.transaction).not.toHaveBeenCalled();
  });

  it("uses a conditional insert with matching user columns", async () => {
    await updateUserOnLogin(profile);

    const statement = dbMocks.execute.mock.calls[0]?.[0];
    expect(statement).toBeInstanceOf(SQL);

    const query = new PgDialect().sqlToQuery(statement);
    expect(query.sql).toMatch(
      /insert into "users" \(\s+"google_sub",\s+"email",\s+"name",\s+"picture",\s+"role",\s+"status",\s+"last_login_at"\s+\)/,
    );
    expect(query.sql).toContain('where not exists (select 1 from "users")');
    expect(query.sql).toContain('on conflict do nothing');
  });

  it("returns Drizzle-mapped timestamp fields for the bootstrapped user", async () => {
    await expect(updateUserOnLogin(profile)).resolves.toMatchObject({
      createdAt,
      lastLoginAt,
    });
  });

  it("denies an unknown user once bootstrap is closed", async () => {
    dbMocks.execute.mockResolvedValueOnce({ rows: [] });

    await expect(updateUserOnLogin(profile)).resolves.toBeNull();
    expect(dbMocks.transaction).not.toHaveBeenCalled();
  });

  it("returns an existing user without attempting bootstrap", async () => {
    dbMocks.update.mockReturnValueOnce({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([bootstrapUser]),
        }),
      }),
    });

    await expect(updateUserOnLogin(profile)).resolves.toEqual(bootstrapUser);
    expect(dbMocks.insert).not.toHaveBeenCalled();
    expect(dbMocks.transaction).not.toHaveBeenCalled();
  });
});
