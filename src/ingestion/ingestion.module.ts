import { Module } from "@nestjs/common";

import { VehiclesModule } from "../vehicles/vehicles.module.js";

@Module({
  imports: [VehiclesModule],
})
export class IngestionModule {}
