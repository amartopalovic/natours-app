# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Natours is a REST API for a tour-booking application built with Node.js, Express, and MongoDB/Mongoose. This is the starter project from Jonas Schmedtmann's Complete Node.js Bootcamp (section 4).

## Commands

```bash
# Development (auto-restarts on change)
npm start

# Production mode
npm run start:prod

# Seed database with sample data (run from project root)
node dev-data/data/import-dev-data.js --import

# Delete all database data
node dev-data/data/import-dev-data.js --delete

# Lint
npx eslint .
```

## Environment Setup

Requires a `config.env` file in the project root (not committed). Minimum required variables:

```
NODE_ENV=development
PORT=3000
DATABASE=mongodb+srv://<username>:<PASSWORD>@cluster.mongodb.net/natours
DATABASE_PASSWORD=yourpassword
```

## Architecture

**Entry points:**
- `server.js` — Loads `config.env`, connects to MongoDB, starts the HTTP server
- `app.js` — Configures Express: middleware stack, mounts routers, unhandled route catch-all, global error handler

**Request lifecycle:**
```
server.js → app.js → routes/ → controlers/ → models/
```

**Note:** The controllers directory is intentionally named `controlers` (one 'l') — match this spelling when importing.

**Routes (`routes/`):**
- `tourRoutes.js` → mounted at `/api/v1/tours`
- `userRoutes.js` → mounted at `/api/v1/users`

**Controllers (`controlers/`):**
- `tourController.js` — full CRUD + `getTourStats` (aggregation) + `getMonthlyPlan` (aggregation) + `aliasTopTours` (middleware preset)
- `userController.js` — stub handlers, not yet implemented
- `errorController.js` — global Express error handler; sends full error detail in dev, sanitized message in prod

**Models (`models/`):**
- `tourModel.js` — Mongoose schema with built-in validators, a `durationWeeks` virtual, and three middleware hooks:
  - `pre('save')`: auto-generates `slug` from name
  - `pre(/^find/)`: excludes `secretTour: true` documents from all queries
  - `pre('aggregate')`: prepends a `$match` stage to exclude secret tours from aggregations

**Utilities (`utils/`):**
- `APIFeatures` — chainable class wrapping a Mongoose query; methods: `.filter()`, `.sort()`, `.limitFields()`, `.paginate()`. Query string operators `gte/gt/lte/lt` are rewritten to `$gte/$gt/$lte/$lt`.
- `AppError` — extends `Error`; sets `statusCode`, `status` (`'fail'` for 4xx, `'error'` for 5xx), and `isOperational: true`
- `catchAsync` — wraps async controller functions so thrown errors are forwarded to `next()` automatically

## API Response Format

All responses follow this shape:
```json
{ "status": "success" | "fail" | "error", "data": { ... } }
```
`results` is included on collection responses. Error responses include `message` (and `error`/`stack` in development).

## Data Seeding

The import script reads from `dev-data/data/tours-simple.json`. It must be run from the project root so that `config.env` is found at `./config.env`.
