import { Injectable } from "@nestjs/common";
import { logger } from "../logger.js";
import { NhtsaService } from "../nhtsa/nhtsa.service.js";
import {
  ListMakesOptions,
  VehicleRepository,
} from "../database/vehicle.repository.js";

@Injectable()
export class VehiclesService {
  private readonly logger = logger.child({
    component: VehiclesService.name,
  });

  constructor(
    private readonly nhtsaService: NhtsaService,
    private readonly vehicleRepository: VehicleRepository,
  ) {}

  async ingestVehicleData() {
    this.logger.info("Vehicle data ingestion started");

    const data = await this.nhtsaService.fetchVehicleData();

    this.vehicleRepository.replace(data);

    this.logger.info(
      {
        makeCount: data.makes.length,
        ingestedAt: data.ingestedAt,
      },
      "Vehicle data ingestion completed",
    );

    return data;
  }

  getMakes(options: ListMakesOptions = {}) {
    return this.vehicleRepository.listMakes(options);
  }
}
