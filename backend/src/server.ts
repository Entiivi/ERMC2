// src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import darbasRouter from "./routes/darbas";

// Routers (the one that has the streaming image endpoints)
import projektaiRouter from "./routes/projektai";

const allowed = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
    "https://127.0.0.1:3000",
];

const app = express();

// Middleware
app.use(express.json());
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true); // allow Postman/internal calls
            if (allowed.includes(origin)) return callback(null, true);
            console.warn(`❌ Blocked by CORS: ${origin}`);
            return callback(new Error("CORS not allowed"));
        },
        credentials: true,
    })
);

// Static legacy photos (keep /photos/** working)
const PHOTOS_DIR = path.join(__dirname, "../uploads/photos");
app.use("/photos", express.static(PHOTOS_DIR, { maxAge: "1y", immutable: true }));
// Serve everything under /uploads (because DB paths start with /uploads/photos)
const uploadsDir = path.join(__dirname, "../uploads");
app.use(
    "/uploads",
    express.static(uploadsDir, {
        maxAge: "7d",
        immutable: true,
    })
);
// Health & ping
app.get("/ping", (_req, res) => res.send("pong"));
app.get("/health", (_req, res) => res.json({ ok: true }));

// ===== API you had in index.ts =====
type ProjektasWithTags = Prisma.ProjektasGetPayload<{
    include: { tags: { include: { tag: true } } }
}>;

// Services
app.get("/services", async (_req, res) => {
    try {
        const rows = await prisma.paslauga.findMany({ orderBy: { title: "asc" } });
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch services" });
    }
});

// Partners
app.get("/partners", async (_req, res) => {
    try {
        const rows = await prisma.partneris.findMany({ orderBy: { name: "asc" } });
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch partners" });
    }
});

// Contacts
app.get("/contacts", async (_req, res) => {
    try {
        const rows = await prisma.kontaktas.findMany({ orderBy: { label: "asc" } });
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch contacts" });
    }
});

app.use("/darbas", darbasRouter);

// About
app.get("/about", async (_req, res) => {
    try {
        const rows = await prisma.apie.findMany({ orderBy: { order: "asc" } });
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch about info" });
    }
});

// Projects (list)
app.get("/projects", async (req, res) => {
    try {
        const tag = (req.query.tag as string) || "Visi";
        const where = tag !== "Visi" ? { tags: { some: { tag: { name: tag } } } } : {};

        const rows = await prisma.projektas.findMany({
            where,
            include: { tags: { include: { tag: true } } },
            orderBy: { date: "desc" },
        });

        const projects = rows.map(r => ({
            id: r.id,
            title: r.title,
            date: r.date.toISOString(),
            cover: r.cover,
            tech: Array.isArray(r.tech) ? r.tech : [],
            tags: r.tags.map(t => t.tag.name),
            excerpt: r.excerpt ?? undefined,
            link: r.link ?? undefined,
        }));

        const allTags = Array.from(new Set(projects.flatMap(p => p.tags))).sort();
        res.json({ projects, tags: allTags });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

// Projects (single)
app.get("/projects/:id", async (req, res) => {
    try {
        const row = await prisma.projektas.findUnique({
            where: { id: req.params.id },
            include: {
                photos: true,
                tags: { include: { tag: true } },
            },
        });
        if (!row) return res.status(404).json({ error: "Not found" });

        res.json({
            id: row.id,
            title: row.title,
            date: row.date.toISOString(),
            cover: row.cover,
            logoUrl: row.logoUrl ?? null,
            tech: Array.isArray(row.tech) ? row.tech : [],
            excerpt: row.excerpt ?? null,
            link: row.link ?? null,
            photos: row.photos,
            tags: row.tags.map(t => t.tag.name),
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch project" });
    }
});

// Tags
app.get("/tags", async (_req, res) => {
    try {
        const rows = await prisma.tag.findMany({ select: { name: true } });
        res.json(rows.map(r => r.name).sort());
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch tags" });
    }
});

// GET one job by id
app.get("/darbas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.darbas.findUnique({
      where: { id }, // adjust if your PK is numeric: { id: Number(id) }
      select: {
        id: true,
        title: true,
        description: true,
        responsibilities: true, // string[] or text? Prisma will map appropriately
        location: true,
        type: true,
        salary: true,
        postedAt: true,
        // If you store a cover or photos in a related table, see below
      },
    });

    if (!job) return res.status(404).json({ error: "Not found" });
    res.json(job);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// ===== Mount the projektai router (streaming fotos endpoints) =====
app.use("/projektai", projektaiRouter);

// Diagnostics (show DB path on startup import)
console.log("DATABASE_URL =", process.env.DATABASE_URL);

export default app;
