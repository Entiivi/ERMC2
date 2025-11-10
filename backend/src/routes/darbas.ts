// backend/src/routes/darbas.ts
import { Router } from "express";
import { prisma } from "../prisma";
import type { JsonValue } from "@prisma/client/runtime/library";
import { Lang } from "@prisma/client";

type DarbasDTO = {
  id: string;
  lang: Lang;
  title: string;
  description?: string | null;
  location?: string | null;
  type?: string | null;
  salary?: string | null;
  postedAt: string;
  responsibilities: string[];
};

function normalizeResponsibilities(v: JsonValue): string[] {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v.map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item !== null) {
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
  if (typeof v === "string") return [v];
  if (typeof v === "object" && v !== null && Array.isArray((v as any).items)) {
    return (v as any).items.map((x: any) => (typeof x === "string" ? x : JSON.stringify(x)));
  }
  return [];
}

function mapDarbas(d: any): DarbasDTO {
  return {
    id: d.id,
    lang: d.lang,
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

// GET /darbas?lang=LT arba /darbas?lang=EN
r.get("/", async (req, res) => {
  try {
    const queryLang = (req.query.lang as string | undefined)?.toUpperCase();
    const lang: Lang = queryLang === "EN" ? Lang.EN : Lang.LT;

    const rows = await prisma.darbas.findMany({
      where: { lang },
      orderBy: { postedAt: "desc" },
      select: {
        id: true,
        lang: true,
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
    console.error("Error fetching darbas:", e);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// GET /darbas/:id
r.get("/:id", async (req, res) => {
  try {
    const row = await prisma.darbas.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        lang: true,
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
    console.error("Error fetching single darbas:", e);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

export default r;
