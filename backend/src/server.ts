// src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import darbasRouter from "./routes/darbas";
import paraiskosRouter from "./routes/paraiskos";
import adminRouter from "./routes/admin";
import partneriaiRouter from "./routes/partneriai";
import apieRouter from "./routes/apie";
import kontaktaiRouter from "./routes/kontaktai";
import workersRouter from "./routes/workers";
import electricityProvidersRouter from "./routes/projectRoutes/electricityProvider";
import projectWorkersRouter from "./routes/projectRoutes/projectWorkers";
import projectProvidersRouter from "./routes/projectRoutes/projectProviders";
import externalGeo from "./routes/external/externalGeo";
import externalElectricity from "./routes/external/externalElectricity";
import ltMaterialsRouter from "./routes/external/ltMaterials";
import projectMaterialsRouter from "./routes/projectRoutes/projectMaterials";
import ltIndexAdmin from "./routes/external/ltIndexAdmin";
import ltIndexPublic from "./routes/external/ltIndexPublic";
import ltPriceSeries from "./routes/external/ltPriceSeries";
import projectLocationRouter from "./routes/projectRoutes/projectLocation";
import geoRouter from "./routes/external/externalGeo";
import rcParcels from "./routes/external/rcParcels";
import projectRcRouter from "./routes/projectRoutes/projectRc";
import electricityAdminRouter from "./routes/projectRoutes/electricityProvider";
import electricityPublicRouter from "./routes/electricityPublic";
import projectElectricityRouter from "./routes/projectRoutes/projectProviders";
import materialsRouter from "./routes/materials";
import iconsRouter from "./routes/icons";


import cron from "node-cron";

// Routers (the one that has the streaming image endpoints)
import projektaiRouter from "./routes/projektai";
import servisaiTikraiservisai from "./routes/servisaiTikraiservisai";


const allowed = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
    "https://127.0.0.1:3000",
];

const app = express();

const uploadsRoot = path.join(process.cwd(), "uploads");
console.log("Serving uploads from:", uploadsRoot);

app.use("/uploadsCV", express.static(uploadsRoot));

// CORS
app.use(express.json());
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true); // allow Postman/internal calls
            if (allowed.includes(origin)) return callback(null, true);
            console.warn(`Blocked by CORS: ${origin}`);
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

type ProjektasWithTags = Prisma.ProjektasGetPayload<{
    include: { tags: { include: { tag: true } } }
}>;

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
app.use("/apie", apieRouter);
app.use("/partneriai", partneriaiRouter);

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
            where: { id },
            select: {
                id: true,
                title: true,
                description: true,
                responsibilities: true,
                location: true,
                type: true,
                salary: true,
                postedAt: true,
            },
        });

        if (!job) return res.status(404).json({ error: "Not found" });
        res.json(job);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch job" });
    }
});

app.use("/projektai", projektaiRouter);
//  paraiska endpoints
app.use("/paraiskos", paraiskosRouter);
app.use("/kontaktai", kontaktaiRouter);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// Leisti naršyklei matyti ikonų SVG iš kito domeno
app.use("/admin/workers", workersRouter);
app.use("/admin/electricity-providers", electricityProvidersRouter);
app.use("/admin/projects", projectWorkersRouter);
app.use("/admin/projects", projectProvidersRouter);
app.use(
    "/uploads/icons",
    cors({ origin: "*" }),
    express.static(path.join(__dirname, "../uploads/icons"), {
        setHeaders: (res, path) => {
            if (path.endsWith(".svg")) {
                res.setHeader("Content-Type", "image/svg+xml");
                res.setHeader("Access-Control-Allow-Origin", "*");
            }
        },
    })
);


app.use("/services", servisaiTikraiservisai);
//  admin endpoints
app.use("/admin", adminRouter);
app.use("/external", ltIndexAdmin);

app.use("/external", ltMaterialsRouter);
app.use("/external", ltIndexPublic);
app.use("/external", ltPriceSeries);

app.use("/external/geo", externalGeo);
app.use("/external/electricity", externalElectricity);


app.use("/projects", projectMaterialsRouter);

app.use("/projects", projectLocationRouter);

app.use("/geo", geoRouter);

app.use("/rc", rcParcels);
app.use("/icons", iconsRouter);
app.use("/projects", projectRcRouter);

app.use("/admin/electricity-providers", electricityAdminRouter);
app.use("/electricity", electricityPublicRouter);
app.use("/materials", materialsRouter);
app.use("/projects", projectElectricityRouter);


app.use("/workers", workersRouter);

app.use("/projects", projectWorkersRouter);

// Diagnostics (show DB path on startup import)
console.log("DATABASE_URL =", process.env.DATABASE_URL);

export default app;
