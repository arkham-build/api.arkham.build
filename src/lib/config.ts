import * as z from "zod";

export const configSchema = z.object({
  INGEST_URL_ARKHAMDB_DECKLISTS: z.string(),
  CORS_ORIGINS: z.string(),
  DATABASE_URL: z.string(),
  HOSTNAME: z.string().default("localhost"),
  INGEST_URL_METADATA: z.string(),
  METADATA_LOCALES: z.string().default("en"),
  METADATA_VERSION: z.coerce.number().int().default(8),
  PORT: z.coerce.number().min(1).max(65535),
});

export type Config = z.infer<typeof configSchema>;

export function configFromEnv(): Config {
  const config = configSchema.parse(process.env);
  return config;
}