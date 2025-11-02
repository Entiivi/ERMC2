// backend/src/routes/darbas.ts
import { Router } from "express";
import { prisma } from "../prisma";
import type { JsonValue } from "@prisma/client/runtime/library";

type DarbasDTO = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  type?: string | null;
  salary?: string | null;
  postedAt: string;                // ISO
  responsibilities: string[];      // <- normalized array
};

function normalizeResponsibilities(v: JsonValue): string[] {
  // Expect an array of strings in DB; be defensive:
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return [v];
  if (v && typeof v === "object" && Array.isArray((v as any).items)) {
    return (v as any).items.map(String);
  }
  return [];
}

function mapDarbas(d: any): DarbasDTO {
  return {
    id: d.id,
    title: d.title,
    description: d.description ?? null,
    location: d.location ?? null,
    type: d.type ?? null,
    salary: d.salary ?? null,
    postedAt: d.postedAt.toISOString(),
    responsibilities: normalizeResponsibilities(d.responsibilities),
  };
}

const r = Router();

// GET /darbas  (list)
r.get("/", async (_req, res) => {
  try {
    const rows = await prisma.darbas.findMany({
      orderBy: { postedAt: "desc" },
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
    res.json(rows.map(mapDarbas));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// GET /darbas/:id  (single)
r.get("/:id", async (req, res) => {
  try {
    const row = await prisma.darbas.findUnique({
      where: { id: req.params.id },
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
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(mapDarbas(row));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

export default r;
