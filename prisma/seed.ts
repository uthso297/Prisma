import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
      posts: {
        create: [
          { title: "Hello Prisma", content: "First post", published: true },
          { title: "Draft idea", content: "Still thinking...", published: false },
        ],
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob",
      posts: {
        create: [
          { title: "Bob's first post", content: "Hi from Bob", published: true },
          { title: "TypeScript tips", content: "Use strict mode", published: true },
        ],
      },
    },
  });

  await prisma.user.create({
    data: { email: "carol@example.com", name: "Carol" },
  });

  console.log("Seeded:", {
    users: await prisma.user.count(),
    posts: await prisma.post.count(),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
