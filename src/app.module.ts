import { Module } from "@nestjs/common";
import { AppLifecycleService } from "./app-lifecycle.service.js";
import { VehiclesModule } from "./vehicles/vehicles.module.js";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: "/graphql",
      autoSchemaFile: true,
      sortSchema: true,
      playground: false,
    }),
    VehiclesModule,
  ],
  providers: [AppLifecycleService],
})
export class AppModule {}
