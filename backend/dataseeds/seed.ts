import { Prisma, PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

function loadJson<T = any>(filename: string): T {
    const filePath = path.join(__dirname, filename);
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as T;
}

async function seedContacts() {
    const rows = loadJson<
        Array<{ label: string; value: string; copyable?: boolean; icon?: string }>
    >("seed-kontaktai.json");
    for (const c of rows) {
        await prisma.kontaktas.upsert({
            where: { label: c.label },
            update: { value: c.value, copyable: !!c.copyable, icon: c.icon ?? null },
            create: { label: c.label, value: c.value, copyable: !!c.copyable, icon: c.icon ?? null },
        });
    }
}

async function seedPartners() {
    const rows = loadJson<Array<{ name: string; imageSrc: string; imageAlt?: string }>>(
        "seed-partneriai.json"
    );
    for (const p of rows) {
        await prisma.partneris.upsert({
            where: { name: p.name },
            update: { imageSrc: p.imageSrc, imageAlt: p.imageAlt ?? null },
            create: { name: p.name, imageSrc: p.imageSrc, imageAlt: p.imageAlt ?? null },
        });
    }
}

async function seedServices() {
    const rows = loadJson<
        Array<{ title: string; subtitle: string; iconUrl: string; details: string }>
    >("seed-paslaugos.json");
    for (const s of rows) {
        await prisma.paslauga.upsert({
            where: { title: s.title },
            update: { subtitle: s.subtitle, iconUrl: s.iconUrl, details: s.details },
            create: { title: s.title, subtitle: s.subtitle, iconUrl: s.iconUrl, details: s.details },
        });
    }
}

type SeedProject = {
  title: string;
  date: string;                 // ISO (yyyy-mm-dd)
  cover: string;
  logoUrl?: string | null;
  tech?: any;                   // will be stored as JSON
  excerpt?: string | null;
  link?: string | null;
  photos?: { url: string; caption?: string | null }[]; // optional in JSON
};

async function seedProjects() {
  const rows = loadJson<SeedProject[]>("seed-projektai.json");

  for (const p of rows) {
    // upsert the project (createdAt/updatedAt are automatic per schema)
    const projektas = await prisma.projektas.upsert({
      // NOTE: requires title @unique in the schema (you have that)
      where: { title: p.title },
      update: {
        date: new Date(p.date),
        cover: p.cover,
        logoUrl: p.logoUrl ?? null,
        tech: (p.tech ?? []) as Prisma.InputJsonValue, // JSON
        excerpt: p.excerpt ?? null,
        link: p.link ?? null,
      },
      create: {
        title: p.title,
        date: new Date(p.date),
        cover: p.cover,
        logoUrl: p.logoUrl ?? null,
        tech: (p.tech ?? []) as Prisma.InputJsonValue, // JSON
        excerpt: p.excerpt ?? null,
        link: p.link ?? null,
      },
    });

    // --- Photos: clear & (re)seed ---
    // Use photos from JSON if provided; else fall back to 3 placeholders
    const photos =
      p.photos?.length
        ? p.photos
        : Array.from({ length: 3 }).map((_, i) => ({
            url: "/photos/placeholder.jpg", // make sure your server serves /photos/*
            caption: `${p.title} – Foto #${i + 1}`,
          }));

    await prisma.photo.deleteMany({ where: { projektasId: projektas.id } });
    await prisma.photo.createMany({
      data: photos.map((ph) => ({
        url: ph.url,
        caption: ph.caption ?? null,
        projektasId: projektas.id,
      })),
    });
  }
}

async function seedJobs() {
    const rows = loadJson<Array<{ title: string; description?: string; responsibilities: any }>>(
        "seed-karjera.json"
    );
    for (const j of rows) {
        await prisma.darbas.upsert({
            where: { title: j.title },
            update: { description: j.description ?? "", responsibilities: j.responsibilities },
            create: { title: j.title, description: j.description ?? "", responsibilities: j.responsibilities },
        });
    }
}

async function seedApie() {
    const rows = loadJson<Array<{ title: string; content: string; order: number }>>("seed-apie.json");
    for (const a of rows) {
        await prisma.apie.upsert({
            where: { title: a.title }, 
            update: { content: a.content, order: a.order },
            create: { title: a.title, content: a.content, order: a.order },
        });
    }
}


async function seedTagsAndAttachToProjects() {
    const tagNames = loadJson<string[]>("seed-tags.json");

    const tags = [];
    for (const name of tagNames) {
        const t = await prisma.tag.upsert({
            where: { name },
            update: {},
            create: { name },
        });
        tags.push(t);
    }

    const projects = await prisma.projektas.findMany({ select: { id: true, title: true } });

    const pickTagsFor = (title: string) => {
        const lc = title.toLowerCase();
        const chosen: string[] = [];
        if (lc.includes("turb")) chosen.push("Turbinos");
        if (lc.includes("katil")) chosen.push("Katilai");
        if (lc.includes("vamzd")) chosen.push("Vamzdynai");
        if (lc.includes("prieži")) chosen.push("Priežiūra");
        if (!chosen.length) chosen.push("Konstrukcijos");
        return chosen;
    };

    for (const p of projects) {
        const wanted = pickTagsFor(p.title);
        const tagIds = tags.filter((t) => wanted.includes(t.name)).map((t) => t.id);

        await prisma.projektas.update({
            where: { id: p.id },
            data: {
                tags: {
                    deleteMany: {},
                    create: tagIds.map((tagId) => ({ tagId })),
                },
            },
        });
    }
}

async function main() {
    console.log("🌱 Seeding…");
    await seedContacts();
    await seedPartners();
    await seedServices();
    await seedProjects();
    await seedJobs();
    await seedApie();
    await seedTagsAndAttachToProjects();
    console.log("✅ Done.");
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
