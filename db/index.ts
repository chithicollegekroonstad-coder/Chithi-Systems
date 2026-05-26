// db/index.ts  (this is the file you import from "@/db")
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
