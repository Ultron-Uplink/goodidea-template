import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { loadEnv } from "./env";

const env = loadEnv();
serve({ fetch: createApp(env).fetch, port: env.PORT });
console.log(
  JSON.stringify({ level: "info", message: "listening", port: env.PORT, sha: env.GIT_SHA }),
);
