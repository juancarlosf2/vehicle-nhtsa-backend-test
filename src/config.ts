import { loadEnvFile } from "node:process";
import { z } from "zod";

try {
  loadEnvFile();
} catch {
  // A local .env file is optional.
}

const environment = z
  .object({
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.string().default("development"),
    LOG_LEVEL: z.string().default("info"),
    REQUEST_TIMEOUT_MS: z.coerce.number().default(15_000),
    VEHICLE_TYPES_CONCURRENCY: z.coerce.number().int().positive().default(25),
    MAKES_URL: z
      .string()
      .default(
        "https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML",
      ),
    VEHICLE_TYPES_URL: z
      .string()
      .default(
        "https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId",
      ),
    DATABASE_PATH: z.string().default("./data/vehicles.db"),
    MIGRATIONS_PATH: z.string().default("./drizzle"),
  })
  .parse(process.env);

export const config = {
  port: environment.PORT,
  environment: environment.NODE_ENV,
  logLevel: environment.LOG_LEVEL,
  requestTimeoutMs: environment.REQUEST_TIMEOUT_MS,
  vehicleTypesConcurrency: environment.VEHICLE_TYPES_CONCURRENCY,
  makesUrl: environment.MAKES_URL,
  vehicleTypesUrl: environment.VEHICLE_TYPES_URL,
  databasePath: environment.DATABASE_PATH,
  migrationsPath: environment.MIGRATIONS_PATH,
};
