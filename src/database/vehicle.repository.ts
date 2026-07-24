import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import type { Make, VehicleData } from "../vehicles/vehicle.types.js";
import { DatabaseService } from "./database.service.js";
import * as schema from "./schema.js";

export interface ListMakesOptions {
  makeId?: number;
  limit?: number;
  offset?: number;
}

@Injectable()
export class VehicleRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  replace(data: VehicleData): void {
    const { db } = this.databaseService;

    db.transaction((tx) => {
      tx.delete(schema.vehicleTypes).run();

      tx.delete(schema.makes).run();

      for (const make of data.makes) {
        tx.insert(schema.makes)
          .values({
            id: make.id,
            name: make.name,
            updatedAt: data.ingestedAt,
          })
          .run();

        if (make.vehicleTypes.length > 0) {
          tx.insert(schema.vehicleTypes)
            .values(
              make.vehicleTypes.map((vehicleType) => ({
                id: vehicleType.id,
                makeId: make.id,
                name: vehicleType.name,
                updatedAt: data.ingestedAt,
              })),
            )
            .run();
        }
      }

      tx.insert(schema.ingestionRuns)
        .values({
          ingestedAt: data.ingestedAt,
        })
        .run();
    });
  }

  listMakes({
    makeId,
    limit = 100,
    offset = 0,
  }: ListMakesOptions = {}): Make[] {
    return this.databaseService.db.query.makes
      .findMany({
        columns: {
          id: true,
          name: true,
        },

        where: makeId === undefined ? undefined : eq(schema.makes.id, makeId),

        with: {
          vehicleTypes: {
            columns: {
              id: true,
              name: true,
            },

            orderBy: (vehicleTypes, { asc }) => [asc(vehicleTypes.name)],
          },
        },

        orderBy: (makes, { asc }) => [asc(makes.name)],

        limit: makeId === undefined ? limit : 1,

        offset: makeId === undefined ? offset : 0,
      })
      .sync();
  }
}
