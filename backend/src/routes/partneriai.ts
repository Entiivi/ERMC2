import { Router } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../prisma";
import { Lang } from "@prisma/client";

const r = Router();

const partnerPhotoDir = path.join(
  __dirname,
  "../../uploads/homepage-photos/partneriai-photos"
);

// GET /partneriai?lang=LT arba /partneriai?lang=EN
r.get("/", async (req, res) => {
  try {
    const queryLang = (req.query.lang as string | undefined)?.toUpperCase();
    const lang: Lang = queryLang === "EN" ? Lang.EN : Lang.LT;

    const partners = await prisma.partneris.findMany({
      where: { lang },
      orderBy: { name: "asc" },
    });

    const results = partners.map((p) => {
      const fullPath = path.join(
        partnerPhotoDir,
        path.basename(p.imageSrc ?? "")
      );

      let base64: string | null = null;

      if (fs.existsSync(fullPath)) {
        const fileBuffer = fs.readFileSync(fullPath);
        const mime = fullPath.endsWith(".png")
          ? "image/png"
          : fullPath.endsWith(".jpg") || fullPath.endsWith(".jpeg")
          ? "image/jpeg"
          : "application/octet-stream";
        base64 = `data:${mime};base64,${fileBuffer.toString("base64")}`;
      }

      return {
        id: p.id,
        name: p.name,
        image: base64,                 // logo base64 – kaip iki šiol
        imageSrc: p.imageSrc ?? null,  // papildomai – failo kelias adminui
        alt: p.imageAlt ?? null,
        lang: p.lang,                  // ir kalba
      };
    });

    res.json(results);
  } catch (err) {
    console.error("Error fetching partneriai:", err);
    res.status(500).json({ error: "Nepavyko gauti partnerių duomenų" });
  }
});

// POST /partneriai – sukurti naują partnerį
r.post("/", async (req, res) => {
  try {
    const {
      name,
      imageSrc,
      imageAlt,
      lang,
    }: {
      name: string;
      imageSrc?: string;
      imageAlt?: string;
      lang?: string;
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Trūksta laukelio 'name'" });
    }

    const normalizedLang: Lang =
      lang?.toUpperCase() === "EN" ? Lang.EN : Lang.LT;

    const created = await prisma.partneris.create({
      data: {
        name,
        imageSrc: imageSrc ?? "",
        imageAlt: imageAlt ?? "",
        lang: normalizedLang,
      },
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating partneris:", err);
    res.status(500).json({ error: "Nepavyko sukurti partnerio" });
  }
});

// PUT /partneriai/:id – atnaujinti partnerį
r.put("/:id", async (req, res) => {
  try {
    const id = req.params.id; // STRING, kaip Prisma schema

    const {
      name,
      imageSrc,
      imageAlt,
      lang,
    }: {
      name?: string;
      imageSrc?: string;
      imageAlt?: string;
      lang?: string;
    } = req.body;

    const normalizedLang: Lang | undefined =
      lang != null
        ? lang.toUpperCase() === "EN"
          ? Lang.EN
          : Lang.LT
        : undefined;

    const updated = await prisma.partneris.update({
      where: { id },
      data: {
        name,
        imageSrc,
        imageAlt,
        lang: normalizedLang,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating partneris:", err);
    res.status(500).json({ error: "Nepavyko atnaujinti partnerio" });
  }
});

// DELETE /partneriai/:id – ištrinti partnerį
r.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id; // STRING

    await prisma.partneris.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting partneris:", err);
    res.status(500).json({ error: "Nepavyko ištrinti partnerio" });
  }
});

export default r;
