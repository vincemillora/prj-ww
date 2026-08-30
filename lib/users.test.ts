import { SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as schema from "@/db/schema";

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

    expect(dbMocks.insert).toHaveBeenCalledOnce();
    expect(dbMocks.execute).not.toHaveBeenCalled();
    expect(dbMocks.transaction).not.toHaveBeenCalled();
  });

  it("uses a raw select that Drizzle can compile for the users insert", async () => {
    await updateUserOnLogin(profile);

    const selection = dbMocks.insertSelect.mock.calls[0]?.[0];
    expect(selection).toBeInstanceOf(SQL);
    expect(() =>
      drizzle
        .mock({ schema })
        .insert(schema.users)
        .select(selection)
        .onConflictDoNothing()
        .returning()
        .toSQL(),
    ).not.toThrow();
  });

  it("returns Drizzle-mapped timestamp fields for the bootstrapped user", async () => {
    await expect(updateUserOnLogin(profile)).resolves.toMatchObject({
      createdAt,
      lastLoginAt,
    });
  });

  it("denies an unknown user once bootstrap is closed", async () => {
    dbMocks.returning.mockResolvedValueOnce([]);

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
