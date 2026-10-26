import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const dbAdapter = new PrismaPg(dbPool);
export const db = new PrismaClient({ adapter: dbAdapter });
