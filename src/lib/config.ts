import * as z from "zod";

export const configSchema = z.object({
  ARKHAMDB_DECKLISTS_INGEST_URL: z.string(),
  CORS_ORIGINS: z.string(),
  DATABASE_URL: z.string(),
  HOSTNAME: z.string().default("localhost"),
  METADATA_INGEST_URL: z.string(),
  METADATA_LOCALES: z.string().default("en"),
  METADATA_VERSION: z.coerce.number().int().default(8),
  PORT: z.coerce.number().min(1).max(65535),
  RECOMMENDATIONS_CUTOFF: z.string().default("2016-9"),
});

export type Config = z.infer<typeof configSchema>;

const config = configSchema.parse(process.env);
export default config;
