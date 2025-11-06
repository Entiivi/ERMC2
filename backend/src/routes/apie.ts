import { Router } from "express";
import { prisma } from "../prisma";
import { Lang } from "@prisma/client"; // <--- pridėta

const r = Router();

// GET /apie?lang=LT arba /apie?lang=EN
r.get("/", async (req, res) => {
  try {
    // paimame kalbos query ir konvertuojame į didžiąsias raides
    const queryLang = (req.query.lang as string | undefined)?.toUpperCase();
    // numatytasis LT, jei nieko nepaduota
    const lang: Lang = queryLang === "EN" ? Lang.EN : Lang.LT;

    const apie = await prisma.apie.findMany({
      where: { lang }, // <--- filtruojame pagal kalbą
      orderBy: { order: "asc" },
    });

    res.json(apie);
  } catch (err) {
    console.error("Error fetching Apie:", err);
    res.status(500).json({ error: "Nepavyko gauti 'Apie mus' duomenų" });
  }
});

export default r;
