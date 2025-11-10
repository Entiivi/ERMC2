import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// Debug PING – paliekam, nes naudingas ateičiai
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

export default router;
