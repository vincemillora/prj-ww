import { describe, expect, it } from "vitest";

import { A, C, L, at, orient, PLANTS, toPath } from "./stem-geometry";

/**
 * The admin's botanicals broke twice on this maths — first because attachment
 * points were hand-estimated instead of sampled, then because the placement
 * transform and the idle animation fought over the same property. These lock
 * the sampling half down: `toPath` and `at` MUST describe the same curve, or
 * leaves float beside stems again.
 */
describe("toPath", () => {
  it("opens with a moveto at the first segment's start", () => {
    expect(toPath([L([2, 15], [27, 8])])).toBe("M2 15 L27 8");
  });

  it("emits cubics and arcs in the same run", () => {
    const d = toPath([
      L([112, 42], [300, 42]),
      A([300, 42], [318, 60], 18, 1),
      C([318, 60], [318, 200], [318, 300], [318, 372]),
    ]);
    expect(d).toBe("M112 42 L300 42 A18 18 0 0 1 318 60 C318 200 318 300 318 372");
  });
});

describe("at", () => {
  it("returns the endpoints of a line at t=0 and t=1", () => {
    const seg = L([42, 60], [42, 360]);
    expect(at(seg, 0)).toMatchObject({ x: 42, y: 60 });
    expect(at(seg, 1)).toMatchObject({ x: 42, y: 360 });
  });

  it("returns the endpoints of a cubic at t=0 and t=1", () => {
    const seg = C([8, 8], [70, 40], [108, 96], [128, 168]);
    const start = at(seg, 0);
    const end = at(seg, 1);
    expect([start.x, start.y]).toEqual([8, 8]);
    expect([end.x, end.y]).toEqual([128, 168]);
  });

  it("gives a tangent that points along the direction of travel", () => {
    // A line running straight down: tangent is +y, no x component.
    const down = at(L([42, 60], [42, 360]), 0.5);
    expect(down.tx).toBe(0);
    expect(down.ty).toBeGreaterThan(0);

    // A cubic leaving its start toward its first control point.
    const curve = at(C([8, 8], [70, 40], [108, 96], [128, 168]), 0);
    expect(curve.tx).toBeGreaterThan(0);
    expect(curve.ty).toBeGreaterThan(0);
  });
});

describe("orient", () => {
  const straightRight = { x: 0, y: 0, tx: 1, ty: 0 };

  it("hangs a tip sprig along the tangent", () => {
    // Travelling +x is 90 degrees clockwise from up; the bloom's own stalk
    // already grows at 30, so it only needs the remaining 60.
    const { angle, mirrored } = orient({ plant: "bloom", seg: 0, t: 1, w: 10 }, straightRight);
    expect(angle).toBeCloseTo(60, 6);
    expect(mirrored).toBe(false);
  });

  it("turns a side sprig onto the stem's normal", () => {
    // Screen coordinates, y down: side 1 is the right-hand side of travel, so
    // on a rightward run it grows DOWN (180 deg) and the bloom's own 30 comes
    // off that.
    const down = orient({ plant: "bloom", seg: 0, t: 0.5, w: 10, side: 1 }, straightRight);
    expect(down.angle).toBeCloseTo(150, 6);
    expect(down.mirrored).toBe(false);

    // side -1 is the opposite normal, straight up (0 deg), and mirrors.
    const up = orient({ plant: "bloom", seg: 0, t: 0.5, w: 10, side: -1 }, straightRight);
    expect(up.angle).toBeCloseTo(30, 6);
    expect(up.mirrored).toBe(true);
  });

  it("reports one rotation for one direction, whatever the sign of zero", () => {
    // Every axis-aligned run produces a negative zero somewhere in the normal,
    // which atan2 turns into -180 instead of 180. Both are the same rotation;
    // the angle is normalised so the same geometry never reports two numbers.
    const a = orient({ plant: "bud", seg: 0, t: 0.5, w: 10, side: 1 }, straightRight);
    const b = orient({ plant: "bud", seg: 0, t: 0.5, w: 10, side: -1 }, { x: 0, y: 0, tx: -1, ty: 0 });
    expect(a.angle).toBeGreaterThan(-180);
    expect(a.angle).toBeLessThanOrEqual(180);
    expect(b.angle).toBeGreaterThan(-180);
    expect(b.angle).toBeLessThanOrEqual(180);
  });

  it("reverses the tangent at an open end", () => {
    const back = orient({ plant: "bloom", seg: 0, t: 0, w: 10, back: true }, straightRight);
    expect(back.angle).toBeCloseTo(-120, 6);
  });

  it("moves the stem anchor to its mirror when the art is flipped", () => {
    const plain = orient({ plant: "leaf", seg: 0, t: 0.5, w: 10 }, straightRight);
    const flipped = orient({ plant: "leaf", seg: 0, t: 0.5, w: 10, flip: true }, straightRight);
    expect(plain.stemX).toBeCloseTo(PLANTS.leaf.stem[0], 6);
    expect(flipped.stemX).toBeCloseTo(1 - PLANTS.leaf.stem[0], 6);
  });

  it("leans a sprig toward the tip by `lift` degrees", () => {
    const square = orient({ plant: "bud", seg: 0, t: 0.5, w: 10, side: 1 }, straightRight);
    const leaning = orient(
      { plant: "bud", seg: 0, t: 0.5, w: 10, side: 1, lift: 30 },
      straightRight,
    );
    // Compared as a turn rather than a subtraction: `orient` normalises to
    // (-180, 180], so a pair that straddles the wrap differs by 30 degrees of
    // rotation but by -330 in raw arithmetic.
    const turn = ((leaning.angle - square.angle + 540) % 360) - 180;
    expect(turn).toBeCloseTo(30, 6);
  });
});
