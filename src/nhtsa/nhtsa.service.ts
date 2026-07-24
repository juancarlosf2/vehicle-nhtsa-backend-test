import { Inject, Injectable } from "@nestjs/common";
import { Make, parseMakesXml, parseVehicleTypesXml } from "../xml.js";
import { logger } from "../logger.js";
import { FetchLike, NHTSA_FETCH } from "./constants.js";
import { config } from "../config.js";

export interface VehicleData {
  makes: Make[];
  ingestedAt: string;
}

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

    const makesPromise = async (make: Omit<Make, "vehicleTypes">) => {
      const url = `${config.vehicleTypesUrl}/${make.id}?format=xml`;

      const vehicleTypesXml = await this.getXml(url);

      return {
        ...make,
        vehicleTypes: parseVehicleTypesXml(vehicleTypesXml),
      };
    };
    const completeMakes = await Promise.all(makes.map(makesPromise));

    return {
      makes: completeMakes,
      ingestedAt: new Date().toISOString(),
    };
  }

  private async getXml(url: string) {
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
