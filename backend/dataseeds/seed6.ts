import { PrismaClient, Lang } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function loadJson<T>(file: string): T {
  const filePath = path.join(__dirname, file);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

async function seedTagsAndAttachToEnProjects() {
  const tagNamesEn = loadJson<string[]>("seed-tags-en.json");

  const tagsEn = [];
  for (const name of tagNamesEn) {
    const t = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: {
        name,
        lang: Lang.EN,
      },
    });
    tagsEn.push(t);
  }

  const projectsEn = await prisma.projektas.findMany({
    where: { lang: Lang.EN },
    select: { id: true, title: true },
  });

  const pickTagsForEN = (title: string) => {
    const lc = title.toLowerCase();
    const chosen: string[] = [];

    if (lc.includes("turbine")) chosen.push("Turbines");
    if (lc.includes("boiler")) chosen.push("Boilers");
    if (lc.includes("pipeline")) chosen.push("Pipelines");
    if (lc.includes("maintenance")) chosen.push("Maintenance");

    if (!chosen.length) chosen.push("Structures");

    return chosen;
  };

  for (const p of projectsEn) {
    const wanted = pickTagsForEN(p.title);
    const tagIds = tagsEn
      .filter((t) => wanted.includes(t.name))
      .map((t) => t.id);

    await prisma.projektas.update({
      where: { id: p.id },
      data: {
        tags: {
          deleteMany: {}, // išvalom tik TO EN projekto senus ryšius
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    });
  }

  console.log(`✅ Attached EN tags to ${projectsEn.length} EN projects`);
}

async function main() {
  console.log("🌱 Seeding EN tags and EN projects...");
  await seedTagsAndAttachToEnProjects();
  console.log("🌿 EN seeding finished!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
