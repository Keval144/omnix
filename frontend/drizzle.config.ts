import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env", override: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
