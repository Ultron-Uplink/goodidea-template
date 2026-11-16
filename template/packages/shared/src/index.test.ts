import { describe, expect, it } from "vitest";
import { errorSchema, healthSchema, versionSchema } from "./index";

describe("shared schemas", () => {
  it("accepts a health body", () =>
    expect(healthSchema.parse({ status: "ok" })).toEqual({ status: "ok" }));
  it("rejects an empty sha", () =>
    expect(versionSchema.safeParse({ sha: "", builtAt: "x" }).success).toBe(false));
  it("rejects an unknown error code", () =>
    expect(errorSchema.safeParse({ error: { code: "oops", message: "m" } }).success).toBe(false));
});
