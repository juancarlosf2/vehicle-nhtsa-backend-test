import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType("VehicleType")
export class VehicleTypeModel {
  @Field(() => Int, {
    description: "NHTSA vehicle-type identifier",
  })
  id!: number;

  @Field({
    description: "Human-readable vehicle-type name",
  })
  name!: string;
}

@ObjectType("Make")
export class MakeModel {
  @Field(() => Int, {
    description: "NHTSA manufacturer identifier",
  })
  id!: number;

  @Field({
    description: "Manufacturer name",
  })
  name!: string;

  @Field(() => [VehicleTypeModel], {
    description: "Vehicle types associated with this manufacturer",
  })
  vehicleTypes!: VehicleTypeModel[];
}
