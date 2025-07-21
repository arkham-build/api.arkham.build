Generate zod schemas from the SQL tables in `./src/db/schema.sql` and write them to `./src/db/schemas`.

# Task
- For each table (skip the `schema_migrations` table), create the following:
  1. A `{tableName}Schema` zod schema.
  2. An inferred type for the schema.
- If there is an existing, matching schema, update the schema as necessary.

# Instructions
- Type JSONB columns as `z.record(z.string(), z.unknown())`.
- All schemas and types should be exported from the file.
- Name each file `{tableName}.schema.ts`
- Don't create an index file.