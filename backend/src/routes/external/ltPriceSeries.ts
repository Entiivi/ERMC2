import { Router } from "express";
import { getPriceSeries } from "../../services/priceSeries.service";

const router = Router();

// GET /external/price-series?key=cement_cem2_42_5r
router.get("/price-series", async (req, res) => {
  try {
    const key = String(req.query.key ?? "");
    if (!key) throw new Error("key is required");

    const data = await getPriceSeries({ key });
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) });
  }
});

export default router;
