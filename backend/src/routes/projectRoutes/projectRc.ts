import { Router } from "express";
import { prisma } from "../../prisma";

const router = Router();

// PUT /projects/:id/rc
router.put("/:id/rc", async (req, res) => {
    try {
        const id = String(req.params.id);

        const data = {
            rcUnikalusNr: req.body?.rcUnikalusNr ?? null,
            rcKadastroNr: req.body?.rcKadastroNr ?? null,
            rcSavivaldybe: req.body?.rcSavivaldybe ?? null,
            rcPlotasHa: req.body?.rcPlotasHa ?? null,
            rcFormavimoData: req.body?.rcFormavimoData ?? null,
            rcRegistravimoData: req.body?.rcRegistravimoData ?? null,
        };

        const updated = await prisma.projektas.update({
            where: { id },
            data,
            select: {
                id: true,
                rcUnikalusNr: true,
                rcKadastroNr: true,
                rcSavivaldybe: true,
                rcPlotasHa: true,
                rcFormavimoData: true,
                rcRegistravimoData: true,
            },
        });

        const eso = await prisma.electricityProvider.findFirst({ where: { type: "DSO" } });
        if (eso) {
            await prisma.projektasElectricityProvider.upsert({
                where: { projektasId_providerId: { projektasId: id, providerId: eso.id } },
                update: {},
                create: { projektasId: id, providerId: eso.id, isPrimary: false },
            });
        }

        res.json({ ok: true, item: updated });
    } catch (e: any) {
        res.status(400).json({ ok: false, error: e?.message ?? String(e) });
    }
});

export default router;
