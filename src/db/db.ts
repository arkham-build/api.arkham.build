import postgres from "postgres";
import config from "../lib/config.ts";

const database = postgres(config.DATABASE_URL);
export default database;
