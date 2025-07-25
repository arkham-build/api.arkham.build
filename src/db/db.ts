import postgres from "postgres";
import config from "../lib/config.ts";

const sql = postgres(config.DATABASE_URL);
export default sql;
