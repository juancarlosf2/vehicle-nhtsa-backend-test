import { Module } from "@nestjs/common";
import { DATABASE_OPTIONS } from "./database.constants.js";
import { config } from "../config.js";
import { DatabaseService } from "./database.service.js";
import { VehicleRepository } from "./vehicle.repository.js";

@Module({
  providers: [
    {
      provide: DATABASE_OPTIONS,
      useValue: {
        databasePath: config.databasePath,
        migrationsPath: config.migrationsPath,
      },
    },
    DatabaseService,
    VehicleRepository,
  ],
  exports: [VehicleRepository],
})
export class DatabaseModule {}
