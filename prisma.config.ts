import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Direct (non-pooled) connection, used only by the CLI for migrations/
    // introspection. Deliberately not the throwing env() helper: `prisma
    // generate` (run from postinstall on every `npm install`, including
    // platforms like Vercel that have no DB configured yet) only needs the
    // schema, not a real connection — it must not fail when this is unset.
    // `prisma migrate`/`db push` still need a real DIRECT_URL in .env.
    url: process.env.DIRECT_URL,
  },
});
