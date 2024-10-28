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

Join Discord Server: https://discord.gg/tDGxWUvTEP
