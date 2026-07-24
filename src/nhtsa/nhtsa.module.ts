import { Module } from "@nestjs/common";
import { NhtsaService } from "./nhtsa.service.js";
import { NHTSA_FETCH } from "./constants.js";

@Module({
  providers: [
    NhtsaService,
    {
      provide: NHTSA_FETCH,
      useValue: globalThis.fetch,
    },
  ],
  exports: [NhtsaService],
})
export class NhtsaModule {}
