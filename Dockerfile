FROM oven/bun:1

WORKDIR /app

COPY package*.json bun.lockb ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]
