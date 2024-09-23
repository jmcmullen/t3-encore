import { drizzle } from "drizzle-orm/postgres-js";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import postgres from "postgres";

import * as schema from "./schema";

export const sql = new SQLDatabase("t3-encore", {
  migrations: "./migrations",
});

const connectionString = sql.connectionString;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
