import express from "express";
import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";

const router = express.Router();

/**
 * Helpers: Prisma Decimal -> JSON safe (number or string)
 * I recommend returning as string to avoid rounding issues in JS.
 */
const decToString = (v: any) =>
    v == null ? null : v instanceof Prisma.Decimal ? v.toString() : String(v);

function serializeMaterial(m: any) {
    // when includeCurrentPrice=true we add currentPrice field (from prices[0])
    const current = Array.isArray(m?.prices) && m.prices.length > 0 ? m.prices[0] : null;

    return {
        key: m.key,
        name: m.name,
        unit: m.unit,
        description: m.description ?? null,
        category: m.category ?? null,
        brand: m.brand ?? null,
        sku: m.sku ?? null,
        isActive: !!m.isActive,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,

        // optional computed field
        currentPrice: current
            ? {
                id: current.id,
                supplier: current.supplier ?? null,
                price: decToString(current.price),
                currency: current.currency ?? "EUR",
                vatRate: decToString(current.vatRate),
                validFrom: current.validFrom,
                validTo: current.validTo ?? null,
            }
            : null,
    };
}

// GET /materials?includeCurrentPrice=true&activeOnly=true
router.get("/", async (req, res) => {
    try {
        const includeCurrentPrice = String(req.query.includeCurrentPrice) === "true";
        const activeOnly = String(req.query.activeOnly) === "true";

        const rows = await prisma.material.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            orderBy: { name: "asc" },
            include: includeCurrentPrice
                ? {
                    prices: {
                        where: { validTo: null },
                        orderBy: { validFrom: "desc" },
                        take: 1,
                    },
                }
                : undefined,
        });

        res.json(includeCurrentPrice ? rows.map(serializeMaterial) : rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch materials" });
    }
});

// GET /materials/:key?includeCurrentPrice=true
router.get("/:key", async (req, res) => {
    try {
        const includeCurrentPrice = String(req.query.includeCurrentPrice) === "true";

        const row = await prisma.material.findUnique({
            where: { key: req.params.key },
            include: includeCurrentPrice
                ? {
                    prices: {
                        where: { validTo: null },
                        orderBy: { validFrom: "desc" },
                        take: 1,
                    },
                }
                : undefined,
        });

        if (!row) return res.status(404).json({ error: "Not found" });

        res.json(includeCurrentPrice ? serializeMaterial(row) : row);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch material" });
    }
});

// POST /materials
router.post("/", async (req, res) => {
    try {
        const {
            key,
            name,
            unit,
            description,
            category,
            brand,
            sku,
            isActive,
        } = req.body ?? {};

        if (!key || typeof key !== "string") {
            return res.status(400).json({ error: "key is required" });
        }
        if (!name || typeof name !== "string") {
            return res.status(400).json({ error: "name is required" });
        }
        if (!unit || typeof unit !== "string") {
            return res.status(400).json({ error: "unit is required" });
        }

        const created = await prisma.material.create({
            data: {
                key: key.trim(),
                name: name.trim(),
                unit: unit.trim(),
                description: typeof description === "string" && description.trim() ? description.trim() : null,
                category: typeof category === "string" && category.trim() ? category.trim() : null,
                brand: typeof brand === "string" && brand.trim() ? brand.trim() : null,
                sku: typeof sku === "string" && sku.trim() ? sku.trim() : null,
                isActive: typeof isActive === "boolean" ? isActive : true,
            },
        });

        res.status(201).json(created);
    } catch (e: any) {
        console.error(e);

        // unique constraint (sku or key)
        if (e?.code === "P2002") {
            return res.status(409).json({ error: "Material with this key/sku already exists" });
        }

        res.status(500).json({ error: "Failed to create material" });
    }
});

// PUT /materials/:key
router.put("/:key", async (req, res) => {
    try {
        const key = req.params.key;
        const {
            name,
            unit,
            description,
            category,
            brand,
            sku,
            isActive,
        } = req.body ?? {};

        const exists = await prisma.material.findUnique({ where: { key } });
        if (!exists) return res.status(404).json({ error: "Not found" });

        const updated = await prisma.material.update({
            where: { key },
            data: {
                name: typeof name === "string" && name.trim() ? name.trim() : undefined,
                unit: typeof unit === "string" && unit.trim() ? unit.trim() : undefined,
                description: typeof description === "string" ? (description.trim() || null) : undefined,
                category: typeof category === "string" ? (category.trim() || null) : undefined,
                brand: typeof brand === "string" ? (brand.trim() || null) : undefined,
                sku: typeof sku === "string" ? (sku.trim() || null) : undefined,
                isActive: typeof isActive === "boolean" ? isActive : undefined,
            },
        });

        res.json(updated);
    } catch (e: any) {
        console.error(e);

        if (e?.code === "P2002") {
            return res.status(409).json({ error: "Material with this sku already exists" });
        }

        res.status(500).json({ error: "Failed to update material" });
    }
});

// DELETE /materials/:key
router.delete("/:key", async (req, res) => {
    try {
        const key = req.params.key;

        // If any projects use this material, deletion will fail due to onDelete: Restrict
        // Option A (recommended): "soft delete" -> isActive=false (do this in UI)
        // Option B: hard delete (below) and catch the error.

        // Clean up price history first (optional, but nice)
        await prisma.materialPrice.deleteMany({ where: { materialKey: key } });

        // Then delete material
        await prisma.material.delete({ where: { key } });

        res.json({ ok: true });
    } catch (e: any) {
        console.error(e);

        // Foreign key restriction (material used in ProjektasMaterial)
        // Prisma might throw P2003 depending on connector behavior.
        if (e?.code === "P2003") {
            return res.status(409).json({
                error: "Material is used in projects. Disable it (isActive=false) instead of deleting.",
            });
        }

        res.status(500).json({ error: "Failed to delete material" });
    }
});

export default router;
