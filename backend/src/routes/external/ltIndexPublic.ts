import { Router } from "express";
import { prisma } from "../../prisma";

const router = Router();

// GET /external/index?group=CEMENT
router.get("/index", async (req, res) => {
  try {
    const group = String(req.query.group ?? "");
    if (!group) throw new Error("group is required");

    const rows = await prisma.ltMaterialIndex.findMany({
      where: { group },
      orderBy: { period: "asc" },
    });

    res.json({
      ok: true,
      group,
      series: rows.map(r => ({ time: r.period, value: r.value, source: r.source })),
    });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) });
  }
});

export default router;
