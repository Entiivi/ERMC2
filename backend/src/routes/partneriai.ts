import { Router } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../prisma";
import { Lang } from "@prisma/client"; // 👈 pridėta

const r = Router();

const partnerPhotoDir = path.join(
  __dirname,
  "../../uploads/homepage-photos/partneriai-photos"
);

// GET /partneriai?lang=LT arba /partneriai?lang=EN
r.get("/", async (req, res) => {
  try {
    // 👇 Paimame kalbą iš query (pvz. /partneriai?lang=EN)
    const queryLang = (req.query.lang as string | undefined)?.toUpperCase();
    const lang: Lang = queryLang === "EN" ? Lang.EN : Lang.LT; // numatyta LT

    // 👇 Filtruojam pagal kalbą
    const partners = await prisma.partneris.findMany({
      where: { lang },
      orderBy: { name: "asc" },
    });

    const results = partners.map((p) => {
      const fullPath = path.join(
        partnerPhotoDir,
        path.basename(p.imageSrc ?? "")
      );
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
    res.status(500).json({ error: "Nepavyko gauti partnerių duomenų" });
  }
});

export default r;
