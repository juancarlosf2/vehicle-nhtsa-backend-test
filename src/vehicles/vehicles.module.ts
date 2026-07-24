import { Module } from "@nestjs/common";
import { NhtsaModule } from "../nhtsa/nhtsa.module.js";
import { DatabaseModule } from "../database/database.module.js";
import { VehiclesService } from "./vehicles.service.js";

@Module({
  imports: [NhtsaModule, DatabaseModule],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
