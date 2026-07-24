import { Inject, Injectable } from "@nestjs/common";
import { parseMakesXml, parseVehicleTypesXml } from "../xml.js";
import { logger } from "../logger.js";
import { FetchLike, NHTSA_FETCH } from "./constants.js";
import { config } from "../config.js";
import { Make, VehicleData } from "../vehicles/vehicle.types.js";

@Injectable()
export class NhtsaService {
  private readonly logger = logger.child({
    component: NhtsaService.name,
  });

  constructor(
    @Inject(NHTSA_FETCH)
    private readonly fetchImpl: FetchLike,
  ) {}

  async fetchVehicleData(): Promise<VehicleData> {
    const makesXml = await this.getXml(config.makesUrl);

    const makes = parseMakesXml(makesXml);
    const completeMakes: Make[] = [];

    for (
      let index = 0;
      index < makes.length;
      index += config.vehicleTypesConcurrency
    ) {
      const batch = makes.slice(index, index + config.vehicleTypesConcurrency);

      const completedBatch = await Promise.all(
        batch.map((make) => this.fetchMakeVehicleTypes(make)),
      );

      completeMakes.push(...completedBatch);

      if (
        completeMakes.length % 500 === 0 ||
        completeMakes.length === makes.length
      ) {
        this.logger.info(
          {
            processedMakes: completeMakes.length,
            totalMakes: makes.length,
          },
          "Vehicle type ingestion progress",
        );
      }
    }

    return {
      makes: completeMakes,
      ingestedAt: new Date().toISOString(),
    };
  }

  private async fetchMakeVehicleTypes(
    make: Omit<Make, "vehicleTypes">,
  ): Promise<Make> {
    const url = `${config.vehicleTypesUrl}/${make.id}?format=xml`;
    const vehicleTypesXml = await this.getXml(url);

    return {
      ...make,
      vehicleTypes: parseVehicleTypesXml(vehicleTypesXml),
    };
  }

  private async getXml(url: string): Promise<string> {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, config.requestTimeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        signal: controller.signal,
        headers: {
          accept: "application/xml",
        },
      });

      if (!response.ok) {
        throw new Error(`NHTSA returned HTTP ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      this.logger.error({ err: error, url }, "NHTSA API request failed.");

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `NHTSA request timed out after ${config.requestTimeoutMs}ms.`,
          { cause: error },
        );
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
