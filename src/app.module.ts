import { Module } from "@nestjs/common";
import { AppLifecycleSerice } from "./app-lifecycle.service.js";

@Module({
  providers: [AppLifecycleSerice],
})
export class AppModule {}
