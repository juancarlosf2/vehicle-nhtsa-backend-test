import { Module } from "@nestjs/common";
import { AppLifecycleSerice } from "./app-lifecycle.service.js";
import { VehiclesModule } from "./vehicles/vehicles.module.js";

@Module({
  imports: [VehiclesModule],
  providers: [AppLifecycleSerice],
})
export class AppModule {}
