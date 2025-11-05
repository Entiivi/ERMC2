import { Router } from "express";
import multer from "multer";
import path from "path";
import { prisma } from "../prisma";

const r = Router();

// --- Configure file uploads ---
const upload = multer({
  dest: path.join(__dirname, "../../uploads/cv"),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/**
 * PAPRASTAS CREATE iš admin panelės (JSON)
 * POST /paraiskos
 */
r.post("/", async (req, res) => {
  try {
    const { name, email, phone, position, cvUrl, message } = req.body;

    if (!name || !email || !position) {
      return res
        .status(400)
        .json({ error: "Privalomi laukai: name, email, position" });
    }

    const paraiska = await prisma.paraiska.create({
      data: {
        name,
        email,
        phone: phone || null,
        position,
        cvUrl: cvUrl || null,
        message: message || null,
      },
    });

    // admin UI tikisi pilno objekto
    res.status(201).json(paraiska);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Nepavyko sukurti paraiškos" });
  }
});

/**
 * PAPRASTAS EDIT iš admin panelės (JSON)
 * PUT /paraiskos/:id
 */
r.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, position, cvUrl, message } = req.body;

    const paraiska = await prisma.paraiska.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(position !== undefined && { position }),
        ...(cvUrl !== undefined && { cvUrl }),
        ...(message !== undefined && { message }),
      },
    });

    res.json(paraiska);
  } catch (err: any) {
    console.error(err);
    // jei id nerastas ir gauni 500 – galima vėliau atskirai apdoroti P2025
    res.status(500).json({ error: "Nepavyko atnaujinti paraiškos" });
  }
});

/**
 * VIEŠAS APPLY su failo upload’u – PALIKTA KAIP BUVO
 * POST /paraiskos/:jobId/apply
 */
r.post("/:jobId/apply", upload.single("cv"), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { name, email, phone, message } = req.body;
    const file = req.file;

    // Find related job
    const job = await prisma.darbas.findUnique({
      where: { id: jobId },
      select: { title: true },
    });
    if (!job) {
      return res.status(404).json({ error: "Darbas nerastas" });
    }

    // Store file path if uploaded
    const cvUrl = file ? `/uploads/cv/${file.filename}` : null;

    // Create Paraiska record
    const paraiska = await prisma.paraiska.create({
      data: {
        name,
        email,
        phone: phone || null,
        position: job.title, // or jobId if you want strict FK
        cvUrl,
        message: message || null,
      },
    });

    res.status(201).json({ ok: true, paraiskaId: paraiska.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Nepavyko pateikti paraiškos" });
  }
});

export default r;
