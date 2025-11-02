import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Writable } from "node:stream";
import { ReadableStream as NodeWebReadable, WritableStream as NodeWebWritable } from "node:stream/web";
import { lookup as getType } from "mime-types";

const router = Router();
const prisma = new PrismaClient();

const PHOTOS_DIR = path.join(__dirname, "../uploads/photos");

router.get("/__ping", (_req, res) => res.send("projektai ok"));

// List all projects (id + title)
router.get("/", async (_req, res) => {
  const rows = await prisma.projektas.findMany({
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
  res.json({ count: rows.length, projects: rows });
});

function safeJoinPhotos(relativeOrRooted: string) {
  const rel = relativeOrRooted.replace(/^\/+/, "");
  const effective = rel.startsWith("photos/") ? rel : `photos/${rel}`;
  const full = path.join(PHOTOS_DIR, effective.replace(/^photos\/?/, ""));
  const norm = path.normalize(full);
  if (!norm.startsWith(PHOTOS_DIR)) throw new Error("Path traversal detected");
  return norm;
}

function baseUrl(req: any) {
  return (process.env.PUBLIC_BASE_URL ||
    `${req.protocol}://${req.get("host") || "localhost:4000"}`).replace(/\/$/, "");
}

/** LIST: returns API hrefs (use these in <Image src=...>) */
router.get("/:id/fotos", async (req, res) => {
  const { id } = req.params;

  try {
    //Verify project exists
    const exists = await prisma.projektas.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) return res.status(404).json({ error: "Projektas nerastas" });

    //Fetch photos for this project
    const photos = await prisma.photo.findMany({
      where: { projektasId: id },
      orderBy: { id: "asc" },
      select: { id: true, url: true, caption: true },
    });

    const base = baseUrl(req);
    const uploadsDir = path.join(__dirname, "../../uploads/photos");

    //Check if the file exists in /uploads/photos/
    const verifiedPhotos = [];
    for (const p of photos) {
      const dbPath = (p.url || "").trim(); // e.g. "/uploads/photos/placeholder.jpg"
      const filename = path.basename(dbPath); // placeholder.jpg
      const abs = path.join(uploadsDir, filename);

      try {
        const st = await fs.stat(abs);
        if (st.isFile()) {
          verifiedPhotos.push({
            id: p.id,
            caption: p.caption ?? null,
            href: `${base}/uploads/photos/${filename}`, // public URL
            original: dbPath,
          });
        } else {
          console.warn(`Skipping non-file path for ${filename}`);
        }
      } catch {
        console.warn(`File not found for ${filename}, skipping`);
      }
    }

    //Return only verified photos
    res.json({
      count: verifiedPhotos.length,
      photos: verifiedPhotos,
    });
  } catch (e) {
    console.error("GET /projektai/:id/fotos failed:", e);
    res.status(500).json({ error: "Nepavyko gauti nuotraukų" });
  }
});

// List projects that HAVE photos (gives you a ready test URL)
router.get("/debug/with-photos", async (_req, res) => {
  const rows = await prisma.projektas.findMany({
    select: { id: true, title: true, photos: { select: { id: true }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });

  const out = rows
    .filter(r => r.photos.length > 0)
    .map(r => ({
      id: r.id,
      title: r.title,
      samplePhotoId: r.photos[0].id,
      listUrl: `/projektai/${r.id}/fotos`,
      sampleHref: `/projektai/${r.id}/fotos/${r.photos[0].id}`,
    }));

  res.json({ count: out.length, projects: out });
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
