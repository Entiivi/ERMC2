// src/routes/external/ltMaterials.ts
import { Router } from "express";
import { LT_MATERIAL_CATALOG } from "../../config/ltMaterialCatalog";
import { estimatePrice } from "../../services/estimate.service";

const router = Router();

// 1) catalog
router.get("/catalog", (_req, res) => {
  res.json({ ok: true, items: LT_MATERIAL_CATALOG });
});

// 2) estimate
router.post("/estimate", async (req, res) => {
  try {
    const { key, quantity, atPeriod } = req.body ?? {};
    const data = await estimatePrice({
      key: String(key),
      quantity: Number(quantity),
      atPeriod: atPeriod ? String(atPeriod) : undefined,
    });
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) });
  }
});


export default router;
