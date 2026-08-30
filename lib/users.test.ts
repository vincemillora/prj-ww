import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  execute: vi.fn(),
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
          id: "1eac86f8-3224-4538-bf44-68590b376aef",
          googleSub: profile.sub,
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          role: "superadmin",
          status: "active",
        },
      ],
    });
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
    expect(dbMocks.transaction).not.toHaveBeenCalled();
  });
});
