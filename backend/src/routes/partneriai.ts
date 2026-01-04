import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { prisma } from "../prisma";
import { Lang } from "@prisma/client";

const r = Router();

/* =========================
   UPLOAD KONFIGŪRACIJA
========================= */

const partnerPhotoDir = path.join(
  __dirname,
  "../../uploads/homepage-photos/partneriai-photos"
);

// užtikrinam, kad katalogas egzistuoja
if (!fs.existsSync(partnerPhotoDir)) {
  fs.mkdirSync(partnerPhotoDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, partnerPhotoDir);
  },
  filename: (_req, file, cb) => {
    const safeName =
      Date.now() +
      "-" +
      file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* =========================
   GET /partneriai
========================= */

r.get("/", async (req, res) => {
  try {
    const queryLang = (req.query.lang as string | undefined)?.toUpperCase();
    const lang: Lang = queryLang === "EN" ? Lang.EN : Lang.LT;

    const partners = await prisma.partneris.findMany({
      where: { lang },
      orderBy: { name: "asc" },
    });

    const results = partners.map((p) => {
      let base64: string | null = null;

      if (p.imageSrc && p.imageSrc.trim() !== "") {
        const filename = path.basename(p.imageSrc);
        const fullPath = path.join(partnerPhotoDir, filename);

        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          const buffer = fs.readFileSync(fullPath);

          const mime = fullPath.endsWith(".png")
            ? "image/png"
            : fullPath.endsWith(".jpg") || fullPath.endsWith(".jpeg")
            ? "image/jpeg"
            : fullPath.endsWith(".svg")
            ? "image/svg+xml"
            : "application/octet-stream";

          base64 = `data:${mime};base64,${buffer.toString("base64")}`;
        }
      }

      return {
        id: p.id,
        name: p.name,
        image: base64,
        imageSrc: p.imageSrc ?? null,
        alt: p.imageAlt ?? null,
        lang: p.lang,
      };
    });

    res.json(results);
  } catch (err) {
    console.error("Error fetching partneriai:", err);
    res.status(500).json({ error: "Nepavyko gauti partnerių duomenų" });
  }
});

/* =========================
   POST /partneriai
========================= */

r.post("/", upload.single("file"), async (req, res) => {
  try {
    const { name, imageAlt, lang } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Trūksta laukelio 'name'" });
    }

    const normalizedLang: Lang =
      lang?.toUpperCase() === "EN" ? Lang.EN : Lang.LT;

    const imageSrc = req.file ? req.file.filename : "";

    const created = await prisma.partneris.create({
      data: {
        name,
        imageSrc,
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

/* =========================
   PUT /partneriai/:id
========================= */

r.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { name, imageAlt, lang } = req.body;

    const normalizedLang: Lang | undefined =
      lang != null
        ? lang.toUpperCase() === "EN"
          ? Lang.EN
          : Lang.LT
        : undefined;

    const data: any = {
      name,
      imageAlt,
      lang: normalizedLang,
    };

    if (req.file) {
      data.imageSrc = req.file.filename;
    }

    const updated = await prisma.partneris.update({
      where: { id: req.params.id },
      data,
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating partneris:", err);
    res.status(500).json({ error: "Nepavyko atnaujinti partnerio" });
  }
});

/* =========================
   DELETE /partneriai/:id
========================= */

r.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

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
