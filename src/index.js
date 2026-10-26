import "dotenv/config";
import express from "express";
import { PrismaClient } from "./generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { buildAuthRouter } from "./routes/auth.js";
import { buildUserRouter } from "./routes/users.js";
import { buildPostRouter } from "./routes/posts.js";
import { buildInteractionRouter } from "./routes/interactions.js";
import { handleErrors } from "./middleware/errorHandler.js";

const { Pool } = pg;

const srv = express();

srv.use(express.json());

const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const dbAdapter = new PrismaPg(dbPool);
const db = new PrismaClient({ adapter: dbAdapter });

srv.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

srv.use("/api/auth", buildAuthRouter(db));
srv.use("/api/users", buildUserRouter(db));
srv.use("/api/posts", buildPostRouter(db));
srv.use("/api/posts", buildInteractionRouter(db));

srv.use(handleErrors);

async function boot() {
  try {
    await db.$queryRaw`SELECT 1`;
    console.log("Database connection successful");
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }

  const PORT = process.env.PORT || 3000;
  srv.listen(PORT, () => {
    console.log(`InstaLite server running on port ${PORT}`);
  });
}

boot();
