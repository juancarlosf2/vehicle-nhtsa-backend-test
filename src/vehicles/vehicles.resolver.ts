import { BadRequestException } from "@nestjs/common";
import { Args, Int, Query, Resolver } from "@nestjs/graphql";

import { MakeModel } from "./vehicle.models.js";
import { VehiclesService } from "./vehicles.service.js";

@Resolver(() => MakeModel)
export class VehiclesResolver {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Query(() => [MakeModel], {
    name: "makes",
    description: "Retrieve stored vehicle makes and their vehicle types",
  })
  getMakes(
    @Args("makeId", {
      type: () => Int,
      nullable: true,
      description: "Optionally retrieve one NHTSA make",
    })
    makeId: number | undefined,

    @Args("limit", {
      type: () => Int,
      defaultValue: 100,
      description: "Maximum number of makes to retrieve",
    })
    limit: number,

    @Args("offset", {
      type: () => Int,
      defaultValue: 0,
      description: "Number of makes to skip",
    })
    offset: number,
  ): MakeModel[] {
    if (limit < 1 || limit > 500) {
      throw new BadRequestException("limit must be between 1 and 500");
    }

    if (offset < 0) {
      throw new BadRequestException("offset cannot be negative");
    }

    return this.vehiclesService.getMakes({
      makeId,
      limit,
      offset,
    });
  }
}
