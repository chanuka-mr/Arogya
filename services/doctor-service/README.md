# Doctor Service

Backend microservice for managing doctor profiles in the Arogya system.

## Run locally

1. Create a local `.env` file from `.env.example`
2. Install dependencies with `npm install`
3. Start the service with `npm run dev`

Default port: `5002`

## Environment variables

- `PORT`
- `MONGO_URI`
- `MONGO_DB_NAME`
- `JWT_SECRET`

## Authentication and roles

Protected routes require a Bearer token.

Supported roles:

- `admin`
- `doctor-manager`
- `service`

Management routes such as create, update, delete, status update, and availability update require:

- `admin` or `doctor-manager`

Integration routes for other microservices require:

- `admin`, `doctor-manager`, or `service`

## Endpoints

### Health

- `GET /health`
- `GET /api/doctors/health`
- `GET /openapi.yaml`
- `GET /api/doctors/docs`

### Doctor CRUD

- `POST /api/doctors`
- `GET /api/doctors`
- `GET /api/doctors/:id`
- `PUT /api/doctors/:id`
- `DELETE /api/doctors/:id`

### Doctor workflow updates

- `PATCH /api/doctors/:id/status`
- `PATCH /api/doctors/:id/availability`

### Integration endpoints

- `GET /api/doctors/:id/summary`
- `POST /api/doctors/:id/availability/check`

## Supported query parameters

- `search`
- `specialty`
- `location`
- `status`
- `isAvailable`
- `minFee`
- `maxFee`
- `minExperience`
- `availableDay`
- `mode`
- `page`
- `limit`
- `sortBy`

## Supported sort values

- `newest`
- `oldest`
- `feeAsc`
- `feeDesc`
- `experienceDesc`
- `experienceAsc`
- `nameAsc`

## Availability rules

- `dayOfWeek` must be one of `monday` to `sunday`
- `mode` must be `in-person`, `online`, or `both`
- time format must be `HH:mm`
- `endTime` must be later than `startTime`

## Automated tests

Run:

`npm test`

The current test suite covers:

- health endpoint
- auth protection
- request validation
- create doctor route
- doctor listing
- integration availability check

## Docker note

The doctor-service container is configured for `docker compose`, but the root compose file still needs runtime values for:

- `MONGO_URI`
- `MONGO_DB_NAME`
- `JWT_SECRET`

Also, several other services in this repository are still scaffold placeholders, so a full multi-service `docker compose up` is not yet guaranteed to succeed until those services are implemented too.
