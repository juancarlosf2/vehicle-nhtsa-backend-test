import { Module } from "@nestjs/common";
import { AppLifecycleSerice } from "./app-lifecycle.service.js";
import { NhtsaModule } from "./nhtsa/nhtsa.module.js";

@Module({
  imports: [NhtsaModule],
  providers: [AppLifecycleSerice],
})
export class AppModule {}
