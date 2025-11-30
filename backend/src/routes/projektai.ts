import { Router } from "express";
import { PrismaClient, Lang, Prisma } from "@prisma/client";
import path from "node:path";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Writable } from "node:stream";
import {
  ReadableStream as NodeWebReadable,
  WritableStream as NodeWebWritable,
} from "node:stream/web";
import { lookup as getType } from "mime-types";

const router = Router();
const prisma = new PrismaClient();

const PHOTOS_DIR = path.join(__dirname, "../uploads/photos");

router.get("/__ping", (_req, res) => res.send("projektai ok"));

// GET /projektai?lang=LT arba /projektai?lang=EN
router.get("/", async (req, res) => {
  try {
    const queryLang = (req.query.lang as string | undefined)?.toUpperCase();
    const lang: Lang = queryLang === "EN" ? Lang.EN : Lang.LT;

    const rows = await prisma.projektas.findMany({
      where: { lang },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const projects = rows.map((p) => ({
      id: p.id,
      title: p.title,
      date: p.date.toISOString(),
      cover: p.cover,
      logoUrl: p.logoUrl ?? undefined,
      tech: Array.isArray(p.tech) ? p.tech : [],
      tags: p.tags.map((pt) => pt.tag.name),
      excerpt: p.excerpt ?? undefined,
      link: p.link ?? undefined,
      client: (p as any).client ?? undefined, // jeigu pridėjai client lauką
    }));

    const allTags = Array.from(
      new Set(projects.flatMap((p) => p.tags))
    ).sort();

    res.json({
      projects,
      tags: allTags,
    });
  } catch (e) {
    console.error("GET /projektai failed:", e);
    res.status(500).json({ error: "Nepavyko gauti projektų" });
  }
});

// CREATE projektą – POST /projektai
router.post("/", async (req, res) => {
  try {
    const {
      title,
      date,
      cover,
      logoUrl,
      tech,
      excerpt,
      link,
      client,
      lang,
      tags,
    }: {
      title: string;
      date?: string;          // ISO arba YYYY-MM-DD
      cover: string;
      logoUrl?: string;
      tech?: any;
      excerpt?: string;
      link?: string;
      client?: string;
      lang?: string;
      tags?: string[];        // pasirenkama: tagų pavadinimai
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Trūksta 'title'" });
    }
    if (!cover || !cover.trim()) {
      return res.status(400).json({ error: "Trūksta 'cover' kelio" });
    }

    const normalizedLang: Lang =
      lang?.toUpperCase() === "EN" ? Lang.EN : Lang.LT;

    const parsedDate = date ? new Date(date) : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Neteisinga data" });
    }

    // tech kaip JSON masyvas
    const techJson =
      Array.isArray(tech) || typeof tech === "object" ? tech : [];

    // Bazinis projektas
    const data: Prisma.ProjektasCreateInput = {
      title: title.trim(),
      date: parsedDate,
      cover: cover.trim(),
      logoUrl: logoUrl?.trim() || null,
      tech: techJson,
      excerpt: excerpt?.trim() || null,
      link: link?.trim() || null,
      lang: normalizedLang,
      // jei pridėjai client lauką:
      ...(client ? { client: client.trim() } : {}),
    };

    // Jei nori iš karto tvarkyti TAG'us:
    if (Array.isArray(tags) && tags.length > 0) {
      (data as any).tags = {
        create: tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      };
    }

    const created = await prisma.projektas.create({
      data,
      include: {
        tags: { include: { tag: true } },
      },
    });

    res.status(201).json({
      id: created.id,
      title: created.title,
      date: created.date.toISOString(),
      cover: created.cover,
      logoUrl: created.logoUrl ?? undefined,
      tech: Array.isArray(created.tech) ? created.tech : [],
      tags: created.tags.map((pt) => pt.tag.name),
      excerpt: created.excerpt ?? undefined,
      link: created.link ?? undefined,
      client: (created as any).client ?? undefined,
    });
  } catch (e: any) {
    console.error("POST /projektai failed:", e);
    if (e?.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Projektas su tokiu pavadinimu jau egzistuoja" });
    }
    res.status(500).json({ error: "Nepavyko sukurti projekto" });
  }
});

// UPDATE projektą – PUT /projektai/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const {
      title,
      date,
      cover,
      logoUrl,
      tech,
      excerpt,
      link,
      client,
      lang,
      tags,
    }: {
      title?: string;
      date?: string;
      cover?: string;
      logoUrl?: string;
      tech?: any;
      excerpt?: string;
      link?: string;
      client?: string;
      lang?: string;
      tags?: string[];
    } = req.body;

    const data: Prisma.ProjektasUpdateInput = {};

    if (title !== undefined) data.title = title.trim();
    if (cover !== undefined) data.cover = cover.trim();
    if (logoUrl !== undefined) data.logoUrl = logoUrl.trim() || null;
    if (excerpt !== undefined) data.excerpt = excerpt.trim() || null;
    if (link !== undefined) data.link = link.trim() || null;
    if (client !== undefined) (data as any).client = client.trim();
    if (lang !== undefined) {
      data.lang = lang.toUpperCase() === "EN" ? Lang.EN : Lang.LT;
    }
    if (date !== undefined) {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ error: "Neteisinga data" });
      }
      data.date = d;
    }
    if (tech !== undefined) {
      data.tech =
        Array.isArray(tech) || typeof tech === "object" ? tech : [];
    }

    // Tagų atnaujinimas (paprastas variantas: ištrinam visus ir sukuriam iš naujo)
    if (tags !== undefined) {
      (data as any).tags = {
        deleteMany: {}, // išvalom senus ryšius
        create: Array.isArray(tags)
          ? tags.map((name) => ({
              tag: {
                connectOrCreate: {
                  where: { name },
                  create: { name },
                },
              },
            }))
          : [],
      };
    }

    const updated = await prisma.projektas.update({
      where: { id },
      data,
      include: {
        tags: { include: { tag: true } },
      },
    });

    res.json({
      id: updated.id,
      title: updated.title,
      date: updated.date.toISOString(),
      cover: updated.cover,
      logoUrl: updated.logoUrl ?? undefined,
      tech: Array.isArray(updated.tech) ? updated.tech : [],
      tags: updated.tags.map((pt) => pt.tag.name),
      excerpt: updated.excerpt ?? undefined,
      link: updated.link ?? undefined,
      client: (updated as any).client ?? undefined,
    });
  } catch (e: any) {
    console.error("PUT /projektai/:id failed:", e);
    if (e?.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Projektas su tokiu pavadinimu jau egzistuoja" });
    }
    res.status(500).json({ error: "Nepavyko atnaujinti projekto" });
  }
});

// GET vieną projektą – GET /projektai/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const p = await prisma.projektas.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
      },
    });

    if (!p) return res.status(404).json({ error: "Projektas nerastas" });

    res.json({
      id: p.id,
      title: p.title,
      date: p.date.toISOString(),
      cover: p.cover,
      logoUrl: p.logoUrl ?? undefined,
      tech: Array.isArray(p.tech) ? p.tech : [],
      tags: p.tags.map((pt) => pt.tag.name),
      excerpt: p.excerpt ?? undefined,
      link: p.link ?? undefined,
      client: (p as any).client ?? undefined,
    });
  } catch (e) {
    console.error("GET /projektai/:id failed:", e);
    res.status(500).json({ error: "Nepavyko gauti projekto" });
  }
});

// DELETE projektą – DELETE /projektai/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.projektas.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /projektai/:id failed:", e);
    res.status(500).json({ error: "Nepavyko ištrinti projekto" });
  }
});

// ======= NUOTRAUKŲ DALIS LIEKA TOKIA PAT =======

function safeJoinPhotos(relativeOrRooted: string) {
  const rel = relativeOrRooted.replace(/^\/+/, "");
  const effective = rel.startsWith("photos/") ? rel : `photos/${rel}`;
  const full = path.join(PHOTOS_DIR, effective.replace(/^photos\/?/, ""));
  const norm = path.normalize(full);
  if (!norm.startsWith(PHOTOS_DIR)) throw new Error("Path traversal detected");
  return norm;
}

function baseUrl(req: any) {
  return (
    process.env.PUBLIC_BASE_URL ||
    `${req.protocol}://${req.get("host") || "localhost:4000"}`
  ).replace(/\/$/, "");
}

/** LIST photos for one project: returns API hrefs (use these in <Image src=...>) */
router.get("/:id/fotos", async (req, res) => {
  const { id } = req.params;

  try {
    const exists = await prisma.projektas.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) return res.status(404).json({ error: "Projektas nerastas" });

    const photos = await prisma.photo.findMany({
      where: { projektasId: id },
      orderBy: { id: "asc" },
      select: { id: true, url: true, caption: true },
    });

    const base = baseUrl(req);
    const uploadsDir = path.join(__dirname, "../../uploads/photos");

    const verifiedPhotos: any[] = [];
    for (const p of photos) {
      const dbPath = (p.url || "").trim();
      const filename = path.basename(dbPath);
      const abs = path.join(uploadsDir, filename);

      try {
        const st = await fs.stat(abs);
        if (st.isFile()) {
          verifiedPhotos.push({
            id: p.id,
            caption: p.caption ?? null,
            href: `${base}/uploads/photos/${filename}`,
            original: dbPath,
          });
        } else {
          console.warn(`Skipping non-file path for ${filename}`);
        }
      } catch {
        console.warn(`File not found for ${filename}, skipping`);
      }
    }

    res.json({
      count: verifiedPhotos.length,
      photos: verifiedPhotos,
    });
  } catch (e) {
    console.error("GET /projektai/:id/fotos failed:", e);
    res.status(500).json({ error: "Nepavyko gauti nuotraukų" });
  }
});

// List projects that HAVE photos (debug, optionally filtered by lang)
router.get("/debug/with-photos", async (req, res) => {
  try {
    const queryLang = (req.query.lang as string | undefined)?.toUpperCase();
    const lang: Lang | undefined =
      queryLang === "EN" ? Lang.EN : queryLang === "LT" ? Lang.LT : undefined;

    const rows = await prisma.projektas.findMany({
      where: lang ? { lang } : undefined,
      select: {
        id: true,
        title: true,
        photos: { select: { id: true }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });

    const out = rows
      .filter((r) => r.photos.length > 0)
      .map((r) => ({
        id: r.id,
        title: r.title,
        samplePhotoId: r.photos[0].id,
        listUrl: `/projektai/${r.id}/fotos`,
        sampleHref: `/projektai/${r.id}/fotos/${r.photos[0].id}`,
      }));

    res.json({ count: out.length, projects: out });
  } catch (e) {
    console.error("GET /projektai/debug/with-photos failed:", e);
    res.status(500).json({ error: "Nepavyko gauti debug duomenų" });
  }
});

/** BINARY: streams bytes (remote via fetch Web Streams, local via fs stream) */
router.get("/:id/fotos/:photoId", async (req, res) => {
  const { id, photoId } = req.params;

  try {
    const photo = await prisma.photo.findFirst({
      where: { id: photoId, projektasId: id },
      select: { url: true },
    });
    if (!photo) return res.status(404).send("Photo not found");

    const src = (photo.url || "").trim();

    // Remote: stream with global fetch (no buffering)
    if (/^https?:\/\//i.test(src)) {
      const r = await fetch(src, { redirect: "follow" });
      if (!r.ok || !r.body) return res.status(404).send("Remote image not found");

      const ct = r.headers.get("content-type") || "application/octet-stream";
      const cl = r.headers.get("content-length");
      res.setHeader("Content-Type", ct);
      if (cl) res.setHeader("Content-Length", cl);
      res.setHeader("Cache-Control", "public, max-age=86400");

      await (r.body as unknown as NodeWebReadable)
        .pipeTo(Writable.toWeb(res) as unknown as NodeWebWritable)
        .catch(() => res.end());
      return;
    }

    // Local: stream file from disk
    const abs = safeJoinPhotos(src);
    const st = await fs.stat(abs).catch(() => null);
    if (!st || !st.isFile()) return res.status(404).send("Local image not found");

    res.setHeader("Content-Type", getType(abs) || "application/octet-stream");
    res.setHeader("Content-Length", String(st.size));
    res.setHeader("Last-Modified", st.mtime.toUTCString());
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");

    createReadStream(abs).pipe(res);
  } catch (e) {
    console.error("GET /projektai/:id/fotos/:photoId failed:", e);
    if (!res.headersSent) res.status(500).send("Failed to load image");
  }
});

export default router;
