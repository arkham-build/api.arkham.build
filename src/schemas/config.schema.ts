import * as z from "zod";

export const ConfigSchema = z.object({
  HOSTNAME: z.string().default("localhost"),
  PORT: z.coerce.number().min(1).max(65535),
  POSTGRES_URL: z.string(),
  CORS_ORIGINS: z.string(),
});

export type Config = z.infer<typeof ConfigSchema>;
