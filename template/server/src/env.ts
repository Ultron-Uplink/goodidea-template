import { z } from "zod";

/** Every environment variable the server reads. Nothing else may touch process.env (ledger G5). */
export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8080),
  GIT_SHA: z.string().min(1).default("dev"),
  BUILT_AT: z.string().min(1).default("unknown"),
});
export type Env = z.infer<typeof envSchema>;

/** Parse the environment. On failure, throw an error that NAMES each bad variable. */
export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(source);
  if (result.success) return result.data;
  const names = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  throw new Error(`Invalid environment: ${names}`);
}
