import express from "express";
import { prisma } from "../prisma";

const router = express.Router();

router.get("/providers", async (req, res) => {
  try {
    const supplier = String(req.query.supplier || "").toLowerCase() === "true";

    const rows = await prisma.electricityProvider.findMany({
      where: supplier ? { type: "SUPPLIER" } : undefined,
      orderBy: { name: "asc" },
    });

    res.json({ ok: true, items: rows });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
});

export default router;
