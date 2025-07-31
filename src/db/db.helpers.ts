import fs from "node:fs";
import path from "node:path";
import { sql } from "kysely";
import type { Database } from "./db.ts";

/**
 * Applies all SQL files in the specified folder to the database.
 * TESTING and SCRIPTS use only.
 */
export async function applySqlFiles(db: Database, pathToFolder: string) {
  const folderPath = path.join(import.meta.dirname, pathToFolder);
  const folder = await fs.promises.readdir(folderPath);

  for (const fileName of folder) {
    const filePath = path.join(folderPath, fileName);
    const migration = await fs.promises.readFile(filePath, "utf-8");
    await db.executeQuery(sql.raw(migration).compile(db));
  }
}
