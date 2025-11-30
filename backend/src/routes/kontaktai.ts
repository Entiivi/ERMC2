import { Router } from "express";
import { prisma } from "../prisma";
import { Lang, Prisma } from "@prisma/client";

const r = Router();

// GET /kontaktai?lang=LT|EN
r.get("/", async (req, res) => {
  try {
    const queryLang = (req.query.lang as string | undefined)?.toUpperCase();

    const where: Prisma.KontaktasWhereInput = {};
    if (queryLang === "EN") {
      where.lang = Lang.EN;
    } else if (queryLang === "LT") {
      where.lang = Lang.LT;
    }

    const rows = await prisma.kontaktas.findMany({
      where,
      orderBy: [
        { lang: "asc" },
        { label: "asc" },
      ],
      select: {
        id: true,
        lang: true,
        label: true,
        value: true,
        copyable: true,
        icon: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(rows);
  } catch (err) {
    console.error("Error fetching kontaktai:", err);
    res.status(500).json({ error: "Nepavyko gauti kontaktų" });
  }
});

// GET /kontaktai/:id
r.get("/:id", async (req, res) => {
  try {
    const row = await prisma.kontaktas.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        lang: true,
        label: true,
        value: true,
        copyable: true,
        icon: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!row) {
      return res.status(404).json({ error: "Kontaktas nerastas" });
    }

    res.json(row);
  } catch (err) {
    console.error("Error fetching kontaktas:", err);
    res.status(500).json({ error: "Nepavyko gauti kontakto" });
  }
});

// POST /kontaktai – sukurti naują kontaktą
r.post("/", async (req, res) => {
  try {
    const {
      label,
      value,
      icon,
      copyable,
      lang,
      // "order" šiuo metu ignoruojam, nes modelyje jo nėra
    }: {
      label: string;
      value: string;
      icon?: string;
      copyable?: boolean;
      lang?: string;
      order?: number;
    } = req.body;

    if (!label || !label.trim()) {
      return res.status(400).json({ error: "Trūksta laukelio 'label'" });
    }
    if (!value || !value.trim()) {
      return res.status(400).json({ error: "Trūksta laukelio 'value'" });
    }

    const normalizedLang: Lang =
      lang?.toUpperCase() === "EN" ? Lang.EN : Lang.LT;

    const created = await prisma.kontaktas.create({
      data: {
        label: label.trim(),
        value: value.trim(),
        icon: icon?.trim() || null,
        copyable: !!copyable,
        lang: normalizedLang,
      },
    });

    res.status(201).json(created);
  } catch (err: any) {
    console.error("Error creating kontaktas:", err);

    // P2002 – unique constraint (label unique)
    if (err?.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Kontaktas su tokia žyma (label) jau egzistuoja" });
    }

    res.status(500).json({ error: "Nepavyko sukurti kontakto" });
  }
});

// PUT /kontaktai/:id – atnaujinti kontaktą
r.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const {
      label,
      value,
      icon,
      copyable,
      lang,
      // order – ignoruojam, nes nėra modelyje
    }: {
      label?: string;
      value?: string;
      icon?: string;
      copyable?: boolean;
      lang?: string;
      order?: number;
    } = req.body;

    const data: Prisma.KontaktasUpdateInput = {};

    if (label !== undefined) data.label = label.trim();
    if (value !== undefined) data.value = value.trim();
    if (icon !== undefined) data.icon = icon.trim() || null;
    if (copyable !== undefined) data.copyable = copyable;
    if (lang !== undefined) {
      data.lang = lang.toUpperCase() === "EN" ? Lang.EN : Lang.LT;
    }

    const updated = await prisma.kontaktas.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (err: any) {
    console.error("Error updating kontaktas:", err);

    if (err?.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Kontaktas su tokia žyma (label) jau egzistuoja" });
    }

    res.status(500).json({ error: "Nepavyko atnaujinti kontakto" });
  }
});

// DELETE /kontaktai/:id – ištrinti kontaktą
r.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await prisma.kontaktas.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting kontaktas:", err);
    res.status(500).json({ error: "Nepavyko ištrinti kontakto" });
  }
});

export default r;
