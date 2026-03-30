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

## Endpoints

### Health

- `GET /health`
- `GET /api/doctors/health`

### Doctor CRUD

- `POST /api/doctors`
- `GET /api/doctors`
- `GET /api/doctors/:id`
- `PUT /api/doctors/:id`
- `DELETE /api/doctors/:id`

### Doctor workflow updates

- `PATCH /api/doctors/:id/status`
- `PATCH /api/doctors/:id/availability`

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
