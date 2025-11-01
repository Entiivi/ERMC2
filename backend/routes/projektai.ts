import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable, Writable } from "node:stream";
import { ReadableStream as NodeWebReadable, WritableStream as NodeWebWritable } from "node:stream/web";
import mime from "mime";

const router = Router();
const prisma = new PrismaClient();

const PHOTOS_DIR = path.join(__dirname, "../uploads/photos");

router.get("/__ping", (_req, res) => res.send("projektai ok"));

// Index: list projects (so /projektai returns JSON, not 404)
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

    console.log("GET /projektai/:id/fotos id=", id);
    // ...
    const exists = await prisma.projektas.findUnique({ where: { id }, select: { id: true, title: true } });
    console.log("projektas exists?", !!exists, exists);
    // ...
    const photos = await prisma.photo.findMany({ where: { projektasId: id }, select: { id: true } });
    console.log("photos count:", photos.length);
    try {
        const exists = await prisma.projektas.findUnique({ where: { id }, select: { id: true } });
        if (!exists) return res.status(404).json({ error: "Projektas nerastas" });

        const photos = await prisma.photo.findMany({
            where: { projektasId: id },
            orderBy: { id: "asc" },
            select: { id: true, url: true, caption: true },
        });

        const base = baseUrl(req);
        res.json({
            photos: photos.map(p => ({
                id: p.id,
                caption: p.caption ?? null,
                href: `${base}/projektai/${id}/fotos/${p.id}`,
                original: p.url,
            })),
        });
    } catch (e) {
        console.error("GET /projektai/:id/fotos failed:", e);
        res.status(500).json({ error: "Nepavyko gauti nuotraukų" });
    }
});

router.get("/debug/with-photos", async (_req, res) => {
  const projects = await prisma.projektas.findMany({
    select: { id: true, title: true, photos: { select: { id: true }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });
  const withOneOrMore = projects
    .filter(p => p.photos.length > 0)
    .map(p => ({ id: p.id, title: p.title, sampleHref: `/projektai/${p.id}/fotos/${p.photos[0].id}` }));
  res.json({ count: withOneOrMore.length, projects: withOneOrMore });
});

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
      sampleHref: `/projektai/${r.id}/fotos/${r.photos[0].id}`,
      listUrl: `/projektai/${r.id}/fotos`,
    }));
  res.json({ count: out.length, projects: out });
});

// List all projects (id + title)
router.get("/", async (_req, res) => {
  const rows = await prisma.projektas.findMany({
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
  res.json({ count: rows.length, projects: rows });
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
            const cl = r.headers.get("content-length"); // may be null for chunked
            res.setHeader("Content-Type", ct);
            if (cl) res.setHeader("Content-Length", cl);
            res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day

            // Pipe DOM ReadableStream -> Node HTTP response (Web WritableStream)
            await (r.body as unknown as NodeWebReadable)
                .pipeTo(Writable.toWeb(res) as unknown as NodeWebWritable)
                .catch(() => res.end()); // ensure response ends on pipe error

            return;
        }

        // Local: stream file from disk
        const abs = safeJoinPhotos(src);
        const st = await fs.stat(abs).catch(() => null);
        if (!st || !st.isFile()) return res.status(404).send("Local image not found");

        res.setHeader("Content-Type", mime.getType(abs) || "application/octet-stream");
        res.setHeader("Content-Length", String(st.size));
        res.setHeader("Last-Modified", st.mtime.toUTCString());
        res.setHeader("Cache-Control", "public, max-age=604800, immutable"); // 7 days

        createReadStream(abs).pipe(res);
    } catch (e) {
        console.error("GET /projektai/:id/fotos/:photoId failed:", e);
        if (!res.headersSent) res.status(500).send("Failed to load image");
    }
});

export default router;
