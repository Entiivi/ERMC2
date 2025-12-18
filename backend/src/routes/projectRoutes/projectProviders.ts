import express from "express";
import { prisma } from "../../prisma";

const router = express.Router();

router.post("/:projectId/providers", async (req, res) => {
  const { projectId } = req.params;
  const { providerId, isPrimary, note } = req.body;

  if (isPrimary === true) {
    await prisma.projektasElectricityProvider.updateMany({
      where: { projektasId: projectId },
      data: { isPrimary: false },
    });
  }

  const row = await prisma.projektasElectricityProvider.upsert({
    where: {
      projektasId_providerId: { projektasId: projectId, providerId },
    },
    update: { isPrimary: !!isPrimary, note },
    create: {
      projektasId: projectId,
      providerId,
      isPrimary: !!isPrimary,
      note,
    },
  });

  res.json(row);
});

router.delete("/:projectId/providers/:providerId", async (req, res) => {
  await prisma.projektasElectricityProvider.delete({
    where: {
      projektasId_providerId: {
        projektasId: req.params.projectId,
        providerId: req.params.providerId,
      },
    },
  });

  res.json({ ok: true });
});

// GET /projects/:projectId/electricity
router.get("/:projectId/electricity", async (req, res) => {
  try {
    const { projectId } = req.params;

    const rows = await prisma.projektasElectricityProvider.findMany({
      where: { projektasId: projectId },
      include: { provider: true },
      orderBy: [{ isPrimary: "desc" }],
    });

    res.json({ ok: true, items: rows });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
});

export default router;
