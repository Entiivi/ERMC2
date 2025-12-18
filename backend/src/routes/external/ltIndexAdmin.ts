import { Router } from "express";
import { prisma } from "../../prisma";

const router = Router();

// POST /external/index/upsert
router.post("/index/upsert", async (req, res) => {
  try {
    const { group, period, value, source } = req.body ?? {};
    if (!group || !period || value == null) throw new Error("group, period, value required");

    const row = await prisma.ltMaterialIndex.upsert({
      where: { group_period: { group: String(group), period: String(period) } },
      update: { value: Number(value), source: source ? String(source) : null },
      create: {
        group: String(group),
        period: String(period),
        value: Number(value),
        source: source ? String(source) : null,
      },
    });

    res.json({ ok: true, row });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) });
  }
});

export default router;
