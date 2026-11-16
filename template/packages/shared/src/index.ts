import { z } from "zod";

/** Response of GET /health. */
export const healthSchema = z.object({ status: z.literal("ok") });
export type Health = z.infer<typeof healthSchema>;

/** Response of GET /version. `sha` is the commit this build came from (ledger G4). */
export const versionSchema = z.object({ sha: z.string().min(1), builtAt: z.string().min(1) });
export type Version = z.infer<typeof versionSchema>;

/** Error body used by every endpoint. Add codes here; never return ad-hoc strings (ledger G5). */
export const errorCodeSchema = z.enum([
  "bad_request",
  "unauthorized",
  "forbidden",
  "not_found",
  "conflict",
  "config",
  "internal",
]);
export const errorSchema = z.object({
  error: z.object({ code: errorCodeSchema, message: z.string() }),
});
export type ApiError = z.infer<typeof errorSchema>;
