# Vehicle Data Service

A TypeScript backend built with NestJS to process vehicle data from the NHTSA
API.

### Status

The ingestion pipeline, database, GraphQL API, tests, Docker setup, and CI
workflow are implemented.

### Features

- Fetch vehicle makes and types from the NHTSA XML APIs
- Validate and parse XML responses
- Transform the responses into one JSON structure
- Persist vehicle data with SQLite and Drizzle ORM
- Expose stored data through GraphQL
- Log application events with Pino
- Run locally or with Docker

### Requirements

- Node.js 22 or newer
- npm
- Docker, when using the container setup

### Local development

Install the dependencies:

```sh
npm install
```

Create a local environment file if needed:

```sh
cp .env.example .env
```

Build and test the project:

```sh
npm run check
```

Download and store the NHTSA data:

```sh
npm run ingest
```

Start the application:

```sh
npm start
```

The ingestion command can take several minutes because NHTSA returns more than
12,000 makes. Vehicle-type requests run in bounded batches, and progress is
logged every 500 makes.

### Environment variables

The variables are parsed with Zod in `src/config.ts`.

- `NODE_ENV` controls the application environment
- `PORT` controls the HTTP server port
- `LOG_LEVEL` controls the Pino logging level
- `REQUEST_TIMEOUT_MS` controls the NHTSA request timeout
- `VEHICLE_TYPES_CONCURRENCY` controls the request batch size
- `MAKES_URL` contains the NHTSA makes endpoint
- `VEHICLE_TYPES_URL` contains the NHTSA vehicle-types endpoint
- `DATABASE_PATH` contains the SQLite file path
- `MIGRATIONS_PATH` contains the Drizzle migrations path

See `.env.example` for a local configuration example.

### Ingestion pipeline

1. `NhtsaService` downloads the vehicle makes XML.
2. The XML is validated and parsed.
3. Makes are divided into batches.
4. Each batch downloads vehicle types with `Promise.all`.
5. The results are combined into one structure.
6. `VehiclesService` passes the data to the repository.
7. The repository replaces the stored snapshot inside a transaction.

If an API request, XML transformation, or database operation fails, ingestion
stops and logs the error.

### Database model

- `makes` stores NHTSA vehicle manufacturers
- `vehicle_types` stores the vehicle types associated with each make
- `ingestion_runs` records successful ingestion timestamps

Drizzle migrations are stored in the `drizzle` directory.

### GraphQL API

The application exposes one GraphQL endpoint at `POST /graphql`.

```graphql
query GetMakes($makeId: Int, $limit: Int, $offset: Int) {
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

`makeId` filters by manufacturer. `limit` and `offset` can be used for
pagination.

### Error handling

- NHTSA requests use a timeout and reject unsuccessful HTTP responses
- Malformed XML is rejected before transformation
- Database replacement uses a transaction
- Invalid GraphQL arguments return GraphQL errors
- Unexpected startup and ingestion errors set a failed process exit code

### Logging

Pino writes structured JSON logs to standard output. The application logs
startup, shutdown, database events, ingestion progress, API failures, and
unexpected errors.

### Testing

The tests cover:

- XML transformation
- Mocked NHTSA API calls
- Request concurrency
- Vehicle service behavior
- Drizzle persistence
- GraphQL retrieval

Run the complete checks with:

```sh
npm run check
```

### Docker

Build the image:

```sh
docker compose build
```

Populate the persistent SQLite volume:

```sh
docker compose run --rm api npm run ingest
```

Start the GraphQL service:

```sh
docker compose up
```

The `vehicle-data` volume keeps the SQLite database between container restarts.

Stop the service with:

```sh
docker compose down
```

Use `docker compose down --volumes` only when intentionally deleting the
persisted database.

### Continuous integration

The GitHub Actions workflow runs on pushes to `main` and pull requests. It
installs dependencies, runs linting and formatting checks, runs the tests,
builds the Docker image, and uploads the compiled application and Drizzle
migrations.
