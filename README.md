# Eventblend API Server

If you find this project helpful, please consider giving it a ⭐ to help it grow and support open source development!

## Setup

### Install dependencies

```
bun install
```

### Add env variables

```
cp .env.example .env
```

### Prisma migrations

```
bunx prisma migrate deploy
```

### Start server

```
bun run dev
```

Setup your postgresql db

### Open

http://localhost:3000

Also setup eventblend frontend locally
https://github.com/harshmangalam/event-blend-frontend

## Tech stack

- Typescript
- Bun
- Hono
- Prisma
- Zod
- Postgresql

## Folder structure

- `/prisma/`

  - contains prisma schema, seeds and migrations.

- `/src/config`

  - contains all configurations file like constants, env config etc.. getting used throughout the application

- `/src/lib`

  - contains lib initialization and utility functions.

- `/src/middleware`

  - contains auth and other middlewares.

- `/src/schema`

  - contains global zod schema that are reusable and getting used in more than one files.

- `/src/types`

  - contains global types i.e `Variables` type for hono etc...

- `/src/feature`
  - contains platform feature i.e
    - auth
    - category
    - event
    - group
    - location
    - network
    - topic
    - user
    - etc...

**Please go through CONTRIBUTING.md file before start contribution and code changes**.

## Docker Support

This project includes Docker support for easy setup and deployment, using Bun runtime.

### Prerequisites

- Docker
- Docker Compose

### Running with Docker

1. Clone the repository:
   ```
   git clone https://github.com/harshmangalam/eventblend-api.git
   cd eventblend-api
   ```

2. Create a `.env` file from the `.env.example`:
   ```
   cp .env.example .env
   ```

3. In the `.env` file, ensure the `DATABASE_URL_DOCKER` is set to:
   ```
   DATABASE_URL_DOCKER="postgresql://postgres:postgres@db:5432/eventblend"
   ```

4. Build and run the Docker containers:
   ```
   docker-compose up --build
   ```

5. The application will be available at `http://localhost:3000`

### Stopping the Docker containers

To stop the running containers, use:
```
docker-compose down
```

To stop the containers and remove the volumes (this will delete the database data), use:
```
docker-compose down -v
```

### Running Prisma migrations

After starting the containers, you may need to run Prisma migrations. You can do this with:
```
docker-compose exec event-blend-server bun run prisma migrate deploy
```

### Accessing the database

To access the PostgreSQL database directly, you can use:
```
docker-compose exec db psql -U postgres -d eventblend
```

### Viewing logs

To view the logs of the event-blend-server:
```
docker-compose logs event-blend-server
```

For real-time logs:
```
docker-compose logs -f event-blend-server
```

### Docker Compose Services

The `docker-compose.yml` file defines two services:

1. `event-blend-server`: The main application server
   - Built from the Dockerfile in the current directory
   - Exposes port 3000
   - Depends on the `db` service
   - Restarts unless stopped manually

2. `db`: PostgreSQL database
   - Uses PostgreSQL 13
   - Environment variables set for database name, user, and password
   - Data persisted in a named volume
   - Restarts unless stopped manually

### Dockerfile

The Dockerfile uses the Bun runtime and follows these steps:
1. Sets up the working directory
2. Copies package files and installs dependencies
3. Copies the rest of the application code
4. Builds the application
5. Exposes port 3000
6. Sets the command to start the server

Make sure all your application code is compatible with the Bun runtime for optimal performance.

Join Discord Server: https://discord.gg/tDGxWUvTEP

