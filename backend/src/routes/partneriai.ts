import { Router } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../prisma";

const r = Router();

// folder containing all partner photos
const partnerPhotoDir = path.join(__dirname, "../../uploads/homepage-photos/partneriai-photos");

// GET /partneriai
// returns all partners with their photo bytes (base64) instead of file path
r.get("/", async (_req, res) => {
  try {
    const partners = await prisma.partneris.findMany({
      orderBy: { name: "asc" },
    });

    const results = partners.map((p) => {
      const fullPath = path.join(partnerPhotoDir, path.basename(p.imageSrc ?? ""));
      let base64 = null;

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
        image: base64,
        alt: p.imageAlt ?? null,
      };
    });

    res.json(results);
  } catch (err) {
    console.error("Error fetching partneriai:", err);
    res.status(500).json({ error: "Failed to fetch partner photos" });
  }
});

export default r;
