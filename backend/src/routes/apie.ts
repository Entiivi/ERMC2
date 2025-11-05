import { Router } from "express";
import { prisma } from "../prisma";

const r = Router();

// GET /apie
r.get("/", async (_req, res) => {
  try {
    const apie = await prisma.apie.findMany({
      orderBy: { order: "asc" },
    });
    res.json(apie);
  } catch (err) {
    console.error("Error fetching Apie:", err);
    res.status(500).json({ error: "Nepavyko gauti 'Apie mus' duomenų" });
  }
});

export default r;
