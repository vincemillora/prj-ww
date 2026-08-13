import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("role capability helpers", () => {
  let capabilities: typeof import("@/lib/dal");

  beforeAll(async () => {
    capabilities = await import("@/lib/dal");
  });

  it("keeps viewers read-only", () => {
    expect(capabilities.canEdit("viewer")).toBe(false);
    expect(capabilities.canManageLabels("viewer")).toBe(false);
    expect(capabilities.canManageUsers("viewer")).toBe(false);
  });

  it("allows editors and reserves user management for the superadmin", () => {
    expect(capabilities.canEdit("admin")).toBe(true);
    expect(capabilities.canManageLabels("admin")).toBe(true);
    expect(capabilities.canManageUsers("admin")).toBe(false);
    expect(capabilities.canManageUsers("superadmin")).toBe(true);
  });
});
