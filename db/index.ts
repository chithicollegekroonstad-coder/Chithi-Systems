// db/index.ts  (this is the file you import from "@/db")
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _sql: NeonQueryFunction<false, false> | undefined;
let _db: NeonHttpDatabase<typeof schema> | undefined;

export function getSql() {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!);
  }
  return _sql;
}

// Re-export as `sql` for tagged template usage in user-biometrics.ts
export const sql = new Proxy({} as NeonQueryFunction<false, false>, {
  apply(_target, _thisArg, args) {
    return (getSql() as Function).apply(null, args);
  },
  get(_target, prop) {
    return Reflect.get(getSql(), prop);
  },
});

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    if (!_db) {
      _db = drizzle(getSql(), { schema });
    }
    return Reflect.get(_db, prop);
  },
});
