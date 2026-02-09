import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres"; // Native Bun/Node driver (no C++ bindings)
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL || "postgres://authx:password@localhost:5432/authx-db");

if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
export { schema };
