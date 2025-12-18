// routes/projectRoutes/projectWorkers.ts
import express from "express";
import { prisma } from "../../prisma";

const router = express.Router();

// GET /projects/:projectId/workers  ✅ (reikalinga SectionWorkers)
router.get("/:projectId/workers", async (req, res) => {
  try {
    const { projectId } = req.params;

    const rows = await prisma.projektasWorker.findMany({
      where: { projektasId: projectId },
      include: { worker: true },
      orderBy: [{ worker: { fullName: "asc" } }],
    });

    res.json({ ok: true, items: rows });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
});

// POST /projects/:projectId/workers
router.post("/:projectId/workers", async (req, res) => {
  const { projectId } = req.params;
  const { workerId, position, startDate, endDate } = req.body;

  const row = await prisma.projektasWorker.upsert({
    where: { projektasId_workerId: { projektasId: projectId, workerId } },
    update: { position: position ?? null, startDate: startDate ?? null, endDate: endDate ?? null },
    create: { projektasId: projectId, workerId, position: position ?? null, startDate: startDate ?? null, endDate: endDate ?? null },
  });

  res.json({ ok: true, item: row });
});

// DELETE /projects/:projectId/workers/:workerId
router.delete("/:projectId/workers/:workerId", async (req, res) => {
  await prisma.projektasWorker.delete({
    where: {
      projektasId_workerId: {
        projektasId: req.params.projectId,
        workerId: req.params.workerId,
      },
    },
  });

  res.json({ ok: true });
});

export default router;
