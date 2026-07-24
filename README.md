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

### Docker

Build the production image:

```sh
docker compose build
```

Populate the persistent SQLite volume. NHTSA currently returns more than
12,000 makes, so this command can take several minutes:

```sh
docker compose run --rm api npm run ingest
```

Start the GraphQL service:

```sh
docker compose up
```

The endpoint is available at `http://localhost:4000/graphql`. The named
`vehicle-data` volume keeps the SQLite database between container restarts.

Stop the service with:

```sh
docker compose down
```

Use `docker compose down --volumes` only when you intentionally want to delete
the persisted database.

### Continuous integration

The GitHub Actions workflow runs on pushes to `main` and pull requests. It
installs dependencies from the lockfile, runs ESLint, checks formatting, runs
the test suite, builds the Docker image, and uploads the compiled application
and Drizzle migrations as an artifact.
