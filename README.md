# Vehicle Data Service

A Typescript Backend using NestJS to process the NHTSA service for a test.

### Status

Early stage of development.

### Planned features

- Fetch vehicle makes and types from NHTSA XML APIs
- Parse XML responses into a json structure
- Persist vehicle data with SQLite and Drizzle ORM
- Expose stored data through GraphQL
- Run as a NestJS application
- Support docker local development

### Requirements

- Node.js 22 or newer
- npm

### Local development

```sh
npm install
npm run build
npm run ingest
npm start
```

The ingestion command can take several minutes because NHTSA currently
returns more than 12,000 makes. Vehicle-type requests run in bounded batches,
and progress is logged every 500 makes.

### Environment variables

# Application environment

- NODE_ENV
- PORT
- LOG_LEVEL
- VEHICLE_TYPES_CONCURRENCY (defaults to 10)

### Database Model

- makes | Stores NHTSA vehicle manufacturers
- vehicle_types | Stores vehicle types associated with each make
- ingestion_runs | This one records successful ingestion timestamps

The following query is available through POST /graphql

```graphql
query GetMakes($makeId: Int, $limit: Int = 100, $offset: Int = 0) {
  makes(makeId: $makeId, limit: $limit, offset: $offset) {
    id
    name
    vehicleTypes {
      id
      name
    }
  }
}
```
