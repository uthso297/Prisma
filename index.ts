import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "./generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter });

async function reset() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
}

async function insert() {
  console.log("\n=== INSERT ===");

  const alice = await prisma.user.create({
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
    include: { posts: true },
  });
  console.log("Created Alice with nested posts:", alice);

  const many = await prisma.user.createMany({
    data: [
      { email: "bob@example.com", name: "Bob" },
      { email: "carol@example.com", name: "Carol" },
      { email: "dave@example.com", name: null },
    ],
    skipDuplicates: true,
  });
  console.log("createMany count:", many.count);

  const bob = await prisma.user.findUniqueOrThrow({ where: { email: "bob@example.com" } });
  await prisma.post.createMany({
    data: [
      { title: "Bob's first post", content: "Hi from Bob", published: true, authorId: bob.id },
      { title: "Bob's draft", content: null, published: false, authorId: bob.id },
      { title: "TypeScript tips", content: "Use strict mode", published: true, authorId: bob.id },
    ],
  });
}

async function find() {
  console.log("\n=== FIND ===");

  const byEmail = await prisma.user.findUnique({ where: { email: "alice@example.com" } });
  console.log("findUnique by email:", byEmail);

  const firstPublished = await prisma.post.findFirst({ where: { published: true } });
  console.log("findFirst published post:", firstPublished);

  const allUsers = await prisma.user.findMany({
    include: { posts: { select: { id: true, title: true, published: true } } },
  });
  console.log("findMany users + posts:", JSON.stringify(allUsers, null, 2));

  const justNames = await prisma.user.findMany({ select: { id: true, name: true } });
  console.log("select projection:", justNames);
}

async function update() {
  console.log("\n=== UPDATE ===");

  const renamed = await prisma.user.update({
    where: { email: "bob@example.com" },
    data: { name: "Robert" },
  });
  console.log("Renamed Bob -> Robert:", renamed);

  const publishedDrafts = await prisma.post.updateMany({
    where: { published: false },
    data: { published: true },
  });
  console.log("Drafts published:", publishedDrafts.count);

  const upserted = await prisma.user.upsert({
    where: { email: "eve@example.com" },
    create: { email: "eve@example.com", name: "Eve" },
    update: { name: "Eve (updated)" },
  });
  console.log("Upserted Eve:", upserted);
}

async function search() {
  console.log("\n=== SEARCH ===");

  const titleMatch = await prisma.post.findMany({
    where: { title: { contains: "Prisma", mode: "insensitive" } },
  });
  console.log("Posts with 'Prisma' in title:", titleMatch);

  const namedUsers = await prisma.user.findMany({
    where: {
      AND: [
        { name: { not: null } },
        { OR: [{ name: { startsWith: "A" } }, { name: { startsWith: "R" } }] },
      ],
    },
  });
  console.log("Users named A* or R*:", namedUsers);

  const authorsOfPublished = await prisma.user.findMany({
    where: { posts: { some: { published: true } } },
    select: { email: true, _count: { select: { posts: true } } },
  });
  console.log("Authors with at least one published post:", authorsOfPublished);
}

async function sortAndOrganize() {
  console.log("\n=== SORT + ORGANIZE ===");

  const sorted = await prisma.post.findMany({
    orderBy: [{ published: "desc" }, { title: "asc" }],
  });
  console.log("Sorted (published desc, title asc):", sorted);

  const page1 = await prisma.user.findMany({
    skip: 0,
    take: 2,
    orderBy: { id: "asc" },
  });
  const page2 = await prisma.user.findMany({
    skip: 2,
    take: 2,
    orderBy: { id: "asc" },
  });
  console.log("Page 1:", page1);
  console.log("Page 2:", page2);

  const totalPosts = await prisma.post.count();
  const publishedCount = await prisma.post.count({ where: { published: true } });
  console.log(`Total posts: ${totalPosts}, published: ${publishedCount}`);

  const grouped = await prisma.post.groupBy({
    by: ["authorId", "published"],
    _count: { _all: true },
    orderBy: { authorId: "asc" },
  });
  console.log("groupBy author + published:", grouped);

  const aggregate = await prisma.post.aggregate({
    _count: { _all: true },
    _min: { id: true },
    _max: { id: true },
  });
  console.log("aggregate:", aggregate);
}

async function remove() {
  console.log("\n=== DELETE ===");

  const carol = await prisma.user.findUnique({ where: { email: "carol@example.com" } });
  if (carol) {
    await prisma.user.delete({ where: { id: carol.id } });
    console.log("Deleted Carol");
  }

  const removed = await prisma.post.deleteMany({ where: { published: false } });
  console.log("Deleted unpublished posts:", removed.count);
}

async function main() {
  await reset();
  await insert();
  await find();
  await update();
  await search();
  await sortAndOrganize();
  await remove();

  console.log("\n=== FINAL STATE ===");
  console.log("Users:", await prisma.user.count());
  console.log("Posts:", await prisma.post.count());
}

main()
  .catch((e) => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error", e.code, e.message);
    } else {
      console.error(e);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
