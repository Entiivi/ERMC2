import { Router } from "express";
import { prisma } from "../prisma";
import { Lang, Prisma } from "@prisma/client";

const r = Router();

// GET /apie?lang=LT arba /apie?lang=EN
r.get("/", async (req, res) => {
  try {
    const queryLang = (req.query.lang as string | undefined)?.toUpperCase();
    const lang: Lang = queryLang === "EN" ? Lang.EN : Lang.LT;

    const apie = await prisma.apie.findMany({
      where: { lang },
      orderBy: { order: "asc" },
    });

    res.json(apie);
  } catch (err) {
    console.error("Error fetching Apie:", err);
    res.status(500).json({ error: "Nepavyko gauti 'Apie mus' duomenų" });
  }
});

// GET /apie/:id
r.get("/:id", async (req, res) => {
  try {
    const row = await prisma.apie.findUnique({
      where: { id: req.params.id },
    });

    if (!row) {
      return res.status(404).json({ error: "Įrašas nerastas" });
    }

    res.json(row);
  } catch (err) {
    console.error("Error fetching single Apie:", err);
    res.status(500).json({ error: "Nepavyko gauti 'Apie mus' įrašo" });
  }
});

// POST /apie – sukurti naują bloką
r.post("/", async (req, res) => {
  try {
    const {
      title,
      content,
      lang,
      order,
    }: {
      title: string;
      content: string;
      lang?: string;
      order?: number;
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Trūksta laukelio 'title'" });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Trūksta laukelio 'content'" });
    }

    const normalizedLang: Lang =
      lang?.toUpperCase() === "EN" ? Lang.EN : Lang.LT;

    const created = await prisma.apie.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        lang: normalizedLang,
        order: typeof order === "number" ? order : 0,
      } as any,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating Apie:", err);
    res.status(500).json({ error: "Nepavyko sukurti 'Apie mus' įrašo" });
  }
});

// PUT /apie/:id – atnaujinti bloką
r.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const {
      title,
      content,
      lang,
      order,
    }: {
      title?: string;
      content?: string;
      lang?: string;
      order?: number;
    } = req.body;

    const data: Prisma.ApieUpdateInput = {};

    if (title !== undefined) data.title = title.trim();
    if (content !== undefined) data.content = content.trim();
    if (lang !== undefined) {
      data.lang = lang.toUpperCase() === "EN" ? Lang.EN : Lang.LT;
    }
    if (order !== undefined) {
      data.order = order;
    }

    const updated = await prisma.apie.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating Apie:", err);
    res.status(500).json({ error: "Nepavyko atnaujinti 'Apie mus' įrašo" });
  }
});

// DELETE /apie/:id – ištrinti bloką
r.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await prisma.apie.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting Apie:", err);
    res.status(500).json({ error: "Nepavyko ištrinti 'Apie mus' įrašo" });
  }
});

export default r;
