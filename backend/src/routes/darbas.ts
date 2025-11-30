// backend/src/routes/darbas.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { Lang, Prisma } from "@prisma/client";

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

function normalizeResponsibilities(v: Prisma.JsonValue | null): string[] {
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
          (firstKey &&
            typeof obj[firstKey] === "string" &&
            (obj[firstKey] as string)) ||
          JSON.stringify(obj)
        );
      }
      return String(item);
    });
  }
  if (typeof v === "string") return [v];
  if (typeof v === "object" && v !== null && Array.isArray((v as any).items)) {
    return (v as any).items.map((x: any) =>
      typeof x === "string" ? x : JSON.stringify(x)
    );
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
    responsibilities: normalizeResponsibilities(
      d.responsibilities as Prisma.JsonValue | null
    ),
  };
}

// helper: textinės eilutės -> JSON masyvas Prisma laukui
function responsibilitiesToJson(lines: string[]): Prisma.InputJsonValue {
  // string[] yra validus InputJsonValue, svarbu negrąžinti null
  return lines;
}

// helper: iš request body (string arba string[]) -> string[]
function parseResponsibilitiesFromBody(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((x) => String(x).trim())
      .filter((x) => x.length > 0);
  }
  if (typeof input === "string") {
    return input
      .split("\n")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
  }
  return [];
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

// POST /darbas – sukurti naują darbo skelbimą
r.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      type,
      salary,
      lang,
      responsibilities,
      postedAt,
    }: {
      title: string;
      description?: string;
      location?: string;
      type?: string;
      salary?: string;
      lang?: string;
      responsibilities?: string[] | string;
      postedAt?: string;
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Trūksta laukelio 'title'" });
    }

    const normalizedLang: Lang =
      lang?.toUpperCase() === "EN" ? Lang.EN : Lang.LT;

    const respLines = parseResponsibilitiesFromBody(responsibilities);

    const created = await prisma.darbas.create({
      data: {
        title,
        description: description ?? "",
        location: location ?? "",
        type: type ?? "",
        salary: salary ?? "",
        lang: normalizedLang,
        responsibilities: responsibilitiesToJson(respLines),
        postedAt: postedAt ? new Date(postedAt) : new Date(),
      },
    });

    res.status(201).json(mapDarbas(created));
  } catch (e) {
    console.error("Error creating darbas:", e);
    res.status(500).json({ error: "Failed to create job" });
  }
});

// PUT /darbas/:id – atnaujinti darbo skelbimą
r.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const {
      title,
      description,
      location,
      type,
      salary,
      lang,
      responsibilities,
      postedAt,
    }: {
      title?: string;
      description?: string;
      location?: string;
      type?: string;
      salary?: string;
      lang?: string;
      responsibilities?: string[] | string;
      postedAt?: string;
    } = req.body;

    const data: Prisma.DarbasUpdateInput = {};

    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (location !== undefined) data.location = location;
    if (type !== undefined) data.type = type;
    if (salary !== undefined) data.salary = salary;
    if (lang !== undefined) {
      data.lang = lang.toUpperCase() === "EN" ? Lang.EN : Lang.LT;
    }
    if (responsibilities !== undefined) {
      const respLines = parseResponsibilitiesFromBody(responsibilities);
      data.responsibilities = responsibilitiesToJson(respLines);
    }
    if (postedAt !== undefined) {
      data.postedAt = new Date(postedAt);
    }

    const updated = await prisma.darbas.update({
      where: { id },
      data,
    });

    res.json(mapDarbas(updated));
  } catch (e) {
    console.error("Error updating darbas:", e);
    res.status(500).json({ error: "Failed to update job" });
  }
});

// DELETE /darbas/:id – ištrinti darbo skelbimą
r.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await prisma.darbas.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("Error deleting darbas:", e);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

export default r;
