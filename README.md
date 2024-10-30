# Eventblend API Server

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
bun prisma:migrate
```

### Start server

```
bun run dev
```

**Setup your postgresql db**

### Prisma

#### Seeding

```
bun prisma:seed
```

#### Open studio

```
bun prisma:studio
```

#### Reset db

```
bun prisma:reset
```

#### Migrations

```
bun prisma:migrate
```

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

- Bun
- Docker and Docker Compose (for Docker setup)
- PostgreSQL (for local setup without Docker)

### Local Setup

1. Clone the repository:
   ```
   git clone https://github.com/harshmangalam/eventblend-api.git
   cd eventblend-api
   ```

2. Install dependencies:
   ```
   bun install
   ```

3. Create a `.env` file from the `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your local PostgreSQL credentials.

5. Run Prisma migrations:
   ```
   bunx prisma migrate deploy
   ```

6. Start the server:
   ```
   bun run dev
   ```

7. Open http://localhost:3000 in your browser.

### Docker Setup

1. Clone the repository:
   ```
   git clone https://github.com/harshmangalam/eventblend-api.git
   cd eventblend-api
   ```

2. Create a `.env` file from the `.env.example`:
   ```
   cp .env.example .env
   ```

3. Build and run the Docker containers:
   ```
   docker-compose up --build
   ```

4. In a new terminal, run Prisma migrations:
   ```
   docker-compose exec event-blend-server bunx prisma migrate deploy
   ```

5. The application will be available at `http://localhost:3000`

## Tech Stack

- TypeScript
- Bun
- Hono
- Prisma
- Zod
- PostgreSQL

## Folder Structure

- `/prisma/`: Contains Prisma schema, seeds, and migrations.
- `/src/config/`: Configuration files.
- `/src/lib/`: Library initialization and utility functions.
- `/src/middleware/`: Auth and other middlewares.
- `/src/schema/`: Global Zod schemas.
- `/src/types/`: Global types.
- `/src/feature/`: Platform features (auth, category, event, etc.).

## Docker Support

### Stopping the Docker Containers

To stop the running containers:
```
docker-compose down
```

To stop the containers and remove the volumes:
```
docker-compose down -v
```

### Accessing the Database

To access the PostgreSQL database directly:
```
docker-compose exec db psql -U postgres -d eventblend
```

### Viewing Logs

To view the logs of the event-blend-server:
```
docker-compose logs event-blend-server
```

For real-time logs:
```
docker-compose logs -f event-blend-server
```

## Contributing

Please read the CONTRIBUTING.md file before making any contributions.

## Community

Join our Discord Server: https://discord.gg/YNk8MRzb

## Frontend Repository
Set up the Eventblend frontend locally:
https://github.com/harshmangalam/event-blend-frontend
