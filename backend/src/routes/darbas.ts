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
  postedAt: string;           // ISO
  responsibilities: string[]; // normalized
};

function normalizeResponsibilities(v: JsonValue): string[] {
  // defensive normalization for different JSON shapes
  if (!v) return [];

  // If array of strings → return as-is
  if (Array.isArray(v)) {
    return v.map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item !== null) {
        // try to extract a property like text, label, value, description
        const obj = item as Record<string, unknown>;
        const firstKey = Object.keys(obj)[0];
        return (
          (typeof obj.text === "string" && obj.text) ||
          (typeof obj.label === "string" && obj.label) ||
          (typeof obj.value === "string" && obj.value) ||
          (firstKey && typeof obj[firstKey] === "string" && (obj[firstKey] as string)) ||
          JSON.stringify(obj)
        );
      }
      return String(item);
    });
  }

  // If it's a plain string
  if (typeof v === "string") return [v];

  // If it's an object with an "items" array inside
  if (typeof v === "object" && v !== null && Array.isArray((v as any).items)) {
    return (v as any).items.map((x: any) => (typeof x === "string" ? x : JSON.stringify(x)));
  }

  // Otherwise nothing usable
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
