import { Router } from "express";
import multer from "multer";
import path from "path";
import { prisma } from "../prisma";
import fs from "fs";

const r = Router();

const uploadDir = path.join(process.cwd(), "uploads", "cv");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    // leidžiam tik PDF (dažniausiai užtenka)
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Leidžiami tik PDF failai"));
    }
    cb(null, true);
  },
});


/**
 * 
 * POST /paraiskos
 */
r.post("/", upload.single("cv"), async (req, res) => {
  try {
    const { name, email, phone, position, cvUrl: bodyCvUrl, message } = req.body;

    if (!name || !email || !position) {
      return res
        .status(400)
        .json({ error: "Privalomi laukai: name, email, position" });
    }

    // jei atėjo failas – imam jį; jei ne – paliekam body cvUrl
    const fileCvUrl = req.file ? `/uploads/cv/${req.file.filename}` : null;
    const cvUrl = fileCvUrl ?? (bodyCvUrl || null);

    const paraiska = await prisma.paraiska.create({
      data: {
        name,
        email,
        phone: phone || null,
        position,
        cvUrl,
        message: message || null,
      },
    });

    res.status(201).json(paraiska);
  } catch (err: any) {
    console.error(err);
    if (err?.message?.includes("Leidžiami tik PDF")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Nepavyko sukurti paraiškos" });
  }
});

/**
 *
 * PUT /paraiskos/:id
 */
r.put("/:id", upload.single("cv"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, position, cvUrl: bodyCvUrl, message } = req.body;

    const fileCvUrl = req.file ? `/uploads/cv/${req.file.filename}` : undefined;

    const paraiska = await prisma.paraiska.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(position !== undefined && { position }),
        ...(message !== undefined && { message }),

        // jei įkeltas failas — perrašom cvUrl į naują
        ...(fileCvUrl !== undefined
          ? { cvUrl: fileCvUrl }
          : bodyCvUrl !== undefined
          ? { cvUrl: bodyCvUrl }
          : {}),
      },
    });

    res.json(paraiska);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Nepavyko atnaujinti paraiškos" });
  }
});

/**
 * VIEŠAS APPLY su failo upload’u – PALIaKTA KAIP BUVO
 * POST /paraiskos/:jobId/apply
 */
r.post("/:jobId/apply", upload.single("cv"), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { name, email, phone, message } = req.body;

    const job = await prisma.darbas.findUnique({
      where: { id: jobId },
      select: { title: true },
    });
    if (!job) return res.status(404).json({ error: "Darbas nerastas" });

    const cvUrl = req.file ? `/uploads/cv/${req.file.filename}` : null;

    const paraiska = await prisma.paraiska.create({
      data: {
        name,
        email,
        phone: phone || null,
        position: job.title,
        cvUrl,
        message: message || null,
      },
    });

    res.status(201).json({ ok: true, paraiskaId: paraiska.id });
  } catch (err: any) {
    console.error(err);
    if (err?.message?.includes("Leidžiami tik PDF")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Nepavyko pateikti paraiškos" });
  }
});

export default r;
