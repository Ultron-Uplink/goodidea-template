import type { ApiError, Health, Version } from "@{{@project_slug}}/shared";
import { Hono } from "hono";
import type { Env } from "./env";

export function createApp(env: Env) {
  const app = new Hono();

  app.get("/health", (c) => c.json({ status: "ok" } satisfies Health));
  app.get("/version", (c) => c.json({ sha: env.GIT_SHA, builtAt: env.BUILT_AT } satisfies Version));

  app.notFound((c) =>
    c.json({ error: { code: "not_found", message: "Not found" } } satisfies ApiError, 404),
  );
  app.onError((err, c) => {
    console.error(JSON.stringify({ level: "error", message: err.message }));
    return c.json(
      { error: { code: "internal", message: "Something went wrong" } } satisfies ApiError,
      500,
    );
  });
  return app;
}
