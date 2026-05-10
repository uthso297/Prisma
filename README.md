# hello_prisma

A minimal full-stack CRUD app built with **Prisma**, **Express**, and a vanilla HTML/JS frontend. Manages `User` and `Post` records in PostgreSQL.

## Tech stack

- **Database:** PostgreSQL
- **ORM:** Prisma 7 (with `@prisma/adapter-pg`)
- **Server:** Express 5 + TypeScript (run via `tsx`)
- **UI:** Single static HTML page, no framework, no build step

## Prerequisites

- **Node.js** ≥ 20
- **PostgreSQL** running locally (or any reachable instance — Neon, Supabase, etc.)
- **Git**

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url> hello_prisma
cd hello_prisma
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your database URL

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/hello_prisma?schema=public"
```

Replace `USER`, `PASSWORD`, and the database name with your own. Make sure the database exists — create it first if needed:

```bash
createdb hello_prisma
```

### 4. Apply migrations

```bash
npx prisma migrate dev
```

This creates the `User` and `Post` tables and generates the Prisma Client into `generated/prisma/`.

### 5. Seed sample data (optional)

```bash
npm run seed
```

Populates the database with a few users and posts so the UI has something to show.

### 6. Start the server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

| Script          | Purpose                                    |
| --------------- | ------------------------------------------ |
| `npm run dev`   | Start Express server with auto-reload      |
| `npm start`     | Start Express server (no watch)            |
| `npm run seed`  | Reset and re-populate the database         |

## Project structure

```
hello_prisma/
├── prisma/
│   ├── schema.prisma          # Data model
│   ├── seed.ts                # Seed script
│   └── migrations/            # Generated SQL migrations
├── generated/prisma/          # Generated Prisma Client (gitignored)
├── public/
│   └── index.html             # UI (vanilla HTML/CSS/JS)
├── server.ts                  # Express API
├── prisma.config.ts           # Prisma config
├── tsconfig.json
└── package.json
```

## API reference

| Method   | Path               | Body                                              | Description                          |
| -------- | ------------------ | ------------------------------------------------- | ------------------------------------ |
| `GET`    | `/api/users`       | —                                                 | List users with their post counts    |
| `POST`   | `/api/users`       | `{ email, name? }`                                | Create a user                        |
| `DELETE` | `/api/users/:id`   | —                                                 | Delete a user (cascades their posts) |
| `GET`    | `/api/posts?q=...` | —                                                 | List posts; optional search          |
| `POST`   | `/api/posts`       | `{ title, content?, authorId, published? }`       | Create a post                        |
| `PATCH`  | `/api/posts/:id`   | `{ title?, content?, published? }`                | Update a post                        |
| `DELETE` | `/api/posts/:id`   | —                                                 | Delete a post                        |

## Common workflows

**Reset the database:**
```bash
npx prisma migrate reset
```

**Inspect the database:**
```bash
npx prisma studio
```

**Change the schema:** edit `prisma/schema.prisma`, then:
```bash
npx prisma migrate dev --name your_change
```
