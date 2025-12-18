import { Router } from "express";
import { prisma } from "../../prisma";

const router = Router();

type NormalizedMaterial = {
  materialKey: string;
  quantity: number;
};

// GET /projects/:id/materials
router.get("/:id/materials", async (req, res) => {
  try {
    const id = String(req.params.id);

    const rows = await prisma.projektasMaterial.findMany({
      where: { projektasId: id },
      orderBy: { createdAt: "asc" },
    });

    res.json({ ok: true, items: rows });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) });
  }
});

// PUT /projects/:id/materials  (bulk replace)
router.put("/:id/materials", async (req, res) => {
  try {
    const id = String(req.params.id);
    const items = Array.isArray(req.body?.items) ? req.body.items : null;
    if (!items) throw new Error("items[] required");

    // validate + normalize (typed)
    const normalized: NormalizedMaterial[] = items.map((x: any) => ({
      materialKey: String(x.materialKey),
      quantity: Number(x.quantity ?? 1),
    }));

    await prisma.$transaction([
      prisma.projektasMaterial.deleteMany({ where: { projektasId: id } }),
      prisma.projektasMaterial.createMany({
        data: normalized.map((x: NormalizedMaterial) => ({
          projektasId: id,
          materialKey: x.materialKey,
          quantity: Number.isFinite(x.quantity) && x.quantity > 0 ? x.quantity : 1,
        })),
      }),
    ]);

    const rows = await prisma.projektasMaterial.findMany({
      where: { projektasId: id },
      orderBy: { createdAt: "asc" },
    });

    res.json({ ok: true, items: rows });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) });
  }
});

export default router;
