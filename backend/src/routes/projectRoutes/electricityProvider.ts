import express from "express";
import { prisma } from "../../prisma";

const router = express.Router();

/**
 * GET all electricity providers
 * GET /admin/electricity-providers
 */
router.get("/", async (_req, res) => {
  try {
    const rows = await prisma.electricityProvider.findMany({
      orderBy: { name: "asc" },
    });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch electricity providers" });
  }
});

/**
 * GET provider by id
 * GET /admin/electricity-providers/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const row = await prisma.electricityProvider.findUnique({
      where: { id: req.params.id },
    });

    if (!row) {
      return res.status(404).json({ error: "Electricity provider not found" });
    }

    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch electricity provider" });
  }
});

/**
 * CREATE provider
 * POST /admin/electricity-providers
 */
router.post("/", async (req, res) => {
  try {
    const { name, website, phone, email } = req.body ?? {};

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "name is required" });
    }

    const created = await prisma.electricityProvider.create({
      data: {
        name: name.trim(),
        website: typeof website === "string" && website.trim() ? website.trim() : null,
        phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
        email: typeof email === "string" && email.trim() ? email.trim() : null,
      },
    });

    res.status(201).json(created);
  } catch (e: any) {
    console.error(e);

    if (e?.code === "P2002") {
      return res.status(409).json({
        error: "Electricity provider with this name already exists",
      });
    }

    res.status(500).json({ error: "Failed to create electricity provider" });
  }
});

/**
 * UPDATE provider
 * PUT /admin/electricity-providers/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, website, phone, email } = req.body ?? {};

    const exists = await prisma.electricityProvider.findUnique({
      where: { id: req.params.id },
    });
    if (!exists) {
      return res.status(404).json({ error: "Electricity provider not found" });
    }

    const updated = await prisma.electricityProvider.update({
      where: { id: req.params.id },
      data: {
        name: typeof name === "string" && name.trim() ? name.trim() : undefined,
        website: typeof website === "string" ? website.trim() || null : undefined,
        phone: typeof phone === "string" ? phone.trim() || null : undefined,
        email: typeof email === "string" ? email.trim() || null : undefined,
      },
    });

    res.json(updated);
  } catch (e: any) {
    console.error(e);

    if (e?.code === "P2002") {
      return res.status(409).json({
        error: "Electricity provider with this name already exists",
      });
    }

    res.status(500).json({ error: "Failed to update electricity provider" });
  }
});

/**
 * DELETE provider
 * DELETE /admin/electricity-providers/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // For SQLite safety: remove joins first
    await prisma.projektasElectricityProvider.deleteMany({
      where: { providerId: id },
    });

    await prisma.electricityProvider.delete({ where: { id } });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete electricity provider" });
  }
});


export default router;
