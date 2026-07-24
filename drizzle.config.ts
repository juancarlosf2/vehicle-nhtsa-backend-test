import { defineConfig } from "drizzle-kit";
import { config } from "./src/config.js";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/database/schema.ts",
  out: "./drizzle",

  dbCredentials: {
    url: config.databasePath,
  },
});
