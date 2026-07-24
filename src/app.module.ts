import { Module } from "@nestjs/common";
import { AppLifecycleSerice } from "./app-lifecycle.service.js";
import { NhtsaModule } from "./nhtsa/nhtsa.module.js";
import { DatabaseModule } from "./database/database.module.js";

@Module({
  imports: [NhtsaModule, DatabaseModule],
  providers: [AppLifecycleSerice],
})
export class AppModule {}
