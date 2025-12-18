import { Router } from "express";
import { prisma } from "../../prisma";
import { ensureESO } from "../../services/ensureESO";

const router = Router();

// GET /projects/:id/location
router.get("/:id/location", async (req, res) => {
  try {
    const id = String(req.params.id);
    const p = await prisma.projektas.findUnique({
      where: { id },
      select: { id: true, address: true, lat: true, lng: true },
    });
    if (!p) return res.status(404).json({ ok: false, error: "Project not found" });
    res.json({ ok: true, item: p });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) });
  }
});


// PUT /projects/:id/location
router.put("/:id/location", async (req, res) => {
  try {
    const id = String(req.params.id);

    const address = req.body?.address != null ? String(req.body.address) : null;
    const lat = req.body?.lat != null ? Number(req.body.lat) : null;
    const lng = req.body?.lng != null ? Number(req.body.lng) : null;

    // leisk null (jei nori išvalyti), bet jei yra – turi būti normalūs skaičiai
    if (lat != null && !Number.isFinite(lat)) throw new Error("lat invalid");
    if (lng != null && !Number.isFinite(lng)) throw new Error("lng invalid");

    const updated = await prisma.projektas.update({
      where: { id },
      data: {
        address: address === "" ? null : address,
        lat,
        lng,
      },
      select: { id: true, address: true, lat: true, lng: true },
    });

        await ensureESO(prisma, id);

    res.json({ ok: true, item: updated });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message ?? String(e) });
  }
});

export default router;
