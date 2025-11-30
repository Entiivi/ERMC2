import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// Debug PING – naudinga sveikatos tikrinimui
router.get("/__ping", (_req, res) => {
  console.log("SERVISAI __PING HIT");
  res.json({ ok: true, from: "servisai.ts" });
});

// GET /services?lang=LT arba /services?lang=EN
router.get("/", async (req, res) => {
  try {
    const queryLang = (req.query.lang as string | undefined)?.toUpperCase();
    const lang = queryLang === "EN" ? "EN" : "LT";

    console.log("=== /services CALLED ===", {
      query: req.query,
      lang,
    });

    const rows = await prisma.service.findMany({
      where: { lang },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        iconUrl: true,
        details: true,
        lang: true,
        order: true,
      },
    });

    console.log("=== /services RESULT ===", {
      lang,
      count: rows.length,
      langs: rows.map((r) => ({ id: r.id, lang: r.lang, title: r.title })),
    });

    res.json(rows);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Nepavyko gauti paslaugų" });
  }
});

// POST /services – sukurti naują paslaugą
router.post("/", async (req, res) => {
  try {
    const {
      title,
      subtitle,
      iconUrl,
      details,
      lang,
      order,
    }: {
      title: string;
      subtitle?: string;
      iconUrl?: string;
      details?: string;
      lang?: string;
      order?: number;
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Trūksta laukelio 'title'" });
    }

    const normalizedLang = lang?.toUpperCase() === "EN" ? "EN" : "LT";

    const created = await prisma.service.create({
      data: {
        title,
        subtitle: subtitle ?? "",
        iconUrl: iconUrl ?? "",
        details: details ?? "",
        lang: normalizedLang,
        order: typeof order === "number" ? order : 0,
      },
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating service:", err);
    res.status(500).json({ error: "Nepavyko sukurti paslaugos" });
  }
});

// PUT /services/:id – atnaujinti paslaugą
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id; // STRING, kaip Prisma schema

    const {
      title,
      subtitle,
      iconUrl,
      details,
      lang,
      order,
    }: {
      title?: string;
      subtitle?: string;
      iconUrl?: string;
      details?: string;
      lang?: string;
      order?: number;
    } = req.body;

    const normalizedLang =
      lang != null ? (lang.toUpperCase() === "EN" ? "EN" : "LT") : undefined;

    const updated = await prisma.service.update({
      where: { id },
      data: {
        title,
        subtitle,
        iconUrl,
        details,
        lang: normalizedLang,
        order,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).json({ error: "Nepavyko atnaujinti paslaugos" });
  }
});

// DELETE /services/:id – ištrinti paslaugą
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id; // STRING

    await prisma.service.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting service:", err);
    res.status(500).json({ error: "Nepavyko ištrinti paslaugos" });
  }
});

export default router;
