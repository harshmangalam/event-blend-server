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

Join Discord Server: https://discord.gg/YNk8MRzb

## Docker Support

This project now includes Docker support for easy setup and deployment, using Bun instead of Node.js.

### Prerequisites

- Docker
- Docker Compose

### Running with Docker

1. Clone the repository:
   ```
   git clone https://github.com/harshmangalam/eventblend-api.git
   cd eventblend-api
   ```

2. Build and run the Docker containers:
   ```
   docker-compose up --build
   ```

3. The application will be available at `http://localhost:3000`

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
