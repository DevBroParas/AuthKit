import "dotenv/config";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

import { drizzle } from "drizzle-orm/node-postgres";

import { Pool } from "pg";

import * as schema from "./schema.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then((client) => {
    console.log("Database connected");

    client.release();
  })
  .catch((err) => {
    console.log("Database connection failed");

    console.log(err);
  });

const db = drizzle(pool, {
  schema,
});

export default db;