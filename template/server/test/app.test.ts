import { errorSchema, healthSchema, versionSchema } from "@{{@project_slug}}/shared";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { loadEnv } from "../src/env";

const app = createApp(loadEnv({ GIT_SHA: "abc123", BUILT_AT: "2026-01-01T00:00:00Z" }));

describe("walking skeleton", () => {
  it("GET /health", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    healthSchema.parse(await res.json());
  });
  it("GET /version returns the commit SHA", async () => {
    const body = versionSchema.parse(await (await app.request("/version")).json());
    expect(body.sha).toBe("abc123");
  });
  it("unknown route returns the error taxonomy", async () => {
    const res = await app.request("/nope");
    expect(res.status).toBe(404);
    errorSchema.parse(await res.json());
  });
  it("bad config fails loudly and names the variable", () => {
    expect(() => loadEnv({ PORT: "not-a-number" })).toThrow(/PORT/);
  });
});
