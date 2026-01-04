// routes/icons.ts
import express from "express";
import { prisma } from "../prisma";

const router = express.Router();

/**
 * GET /icons
 * Optional query:
 *  - q=search text (name/category/alt)
 *  - category=Exact category match
 *  - take=number (default 200, max 500)
 *  - skip=number
 */
router.get("/", async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const category =
      typeof req.query.category === "string" && req.query.category.trim()
        ? req.query.category.trim()
        : null;

    const takeRaw = Number(req.query.take ?? 200);
    const skipRaw = Number(req.query.skip ?? 0);

    const take = Number.isFinite(takeRaw) ? Math.min(Math.max(takeRaw, 1), 500) : 200;
    const skip = Number.isFinite(skipRaw) ? Math.max(skipRaw, 0) : 0;

    const where: any = {};
    if (category) where.category = category;

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { alt: { contains: q, mode: "insensitive" } },
      ];
    }

    const items = await prisma.icon.findMany({
      where,
      orderBy: [{ category: "asc" }, { name: "asc" }],
      take,
      skip,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        alt: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Front-end friendly shape
    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch icons" });
  }
});

/**
 * GET /icons/categories
 * Returns distinct categories for dropdowns/filters.
 */
router.get("/categories", async (_req, res) => {
  try {
    const rows = await prisma.icon.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    const items = rows
      .map((r) => r.category)
      .filter((c): c is string => !!c && c.trim().length > 0);

    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch icon categories" });
  }
});

/**
 * GET /icons/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const row = await prisma.icon.findUnique({
      where: { id: req.params.id },
    });

    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch icon" });
  }
});

/**
 * POST /icons
 * body: { name, imageUrl, alt?, category? }
 */
router.post("/", async (req, res) => {
  try {
    const { name, imageUrl, alt, category } = req.body ?? {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }
    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    const created = await prisma.icon.create({
      data: {
        name: name.trim(),
        imageUrl: imageUrl.trim(),
        alt: typeof alt === "string" && alt.trim() ? alt.trim() : null,
        category: typeof category === "string" && category.trim() ? category.trim() : null,
      },
    });

    res.status(201).json(created);
  } catch (e: any) {
    console.error(e);
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "Icon with this name already exists" });
    }
    res.status(500).json({ error: "Failed to create icon" });
  }
});

/**
 * PUT /icons/:id
 * body: { name?, imageUrl?, alt?, category? }
 */
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { name, imageUrl, alt, category } = req.body ?? {};

    const exists = await prisma.icon.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: "Not found" });

    const updated = await prisma.icon.update({
      where: { id },
      data: {
        name: typeof name === "string" && name.trim() ? name.trim() : undefined,
        imageUrl: typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : undefined,
        alt: typeof alt === "string" ? (alt.trim() || null) : undefined,
        category: typeof category === "string" ? (category.trim() || null) : undefined,
      },
    });

    res.json(updated);
  } catch (e: any) {
    console.error(e);
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "Icon with this name already exists" });
    }
    res.status(500).json({ error: "Failed to update icon" });
  }
});

/**
 * DELETE /icons/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await prisma.icon.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete icon" });
  }
});

export default router;
