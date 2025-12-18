import express from "express";
import { prisma } from "../prisma";

const router = express.Router();

// GET all workers
router.get("/", async (_req, res) => {
    try {
        const rows = await prisma.worker.findMany({
            orderBy: { fullName: "asc" },
        });
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch workers" });
    }
});

// GET worker by id
router.get("/:id", async (req, res) => {
    try {
        const row = await prisma.worker.findUnique({ where: { id: req.params.id } });
        if (!row) return res.status(404).json({ error: "Not found" });
        res.json(row);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch worker" });
    }
});

// CREATE worker
router.post("/", async (req, res) => {
    try {
        const { fullName, email, phone, role } = req.body ?? {};

        if (!fullName || typeof fullName !== "string") {
            return res.status(400).json({ error: "fullName is required" });
        }

        const created = await prisma.worker.create({
            data: {
                fullName: fullName.trim(),
                email: typeof email === "string" && email.trim() ? email.trim() : null,
                phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
                role: typeof role === "string" && role.trim() ? role.trim() : null,
            },
        });

        res.status(201).json(created);
    } catch (e: any) {
        console.error(e);

        // unique email error
        if (e?.code === "P2002") {
            return res.status(409).json({ error: "Worker with this email already exists" });
        }

        res.status(500).json({ error: "Failed to create worker" });
    }
});

// UPDATE worker
router.put("/:id", async (req, res) => {
    try {
        const { fullName, email, phone, role } = req.body ?? {};

        const exists = await prisma.worker.findUnique({ where: { id: req.params.id } });
        if (!exists) return res.status(404).json({ error: "Not found" });

        const updated = await prisma.worker.update({
            where: { id: req.params.id },
            data: {
                fullName:
                    typeof fullName === "string" && fullName.trim()
                        ? fullName.trim()
                        : undefined,
                email:
                    typeof email === "string"
                        ? email.trim() || null
                        : undefined,
                phone:
                    typeof phone === "string"
                        ? phone.trim() || null
                        : undefined,
                role:
                    typeof role === "string"
                        ? role.trim() || null
                        : undefined,
            },
        });

        res.json(updated);
    } catch (e: any) {
        console.error(e);

        if (e?.code === "P2002") {
            return res.status(409).json({ error: "Worker with this email already exists" });
        }

        res.status(500).json({ error: "Failed to update worker" });
    }
});

// DELETE worker (also removes assignments via join table if you added cascade; otherwise you must delete joins first)
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        // safest for SQLite: delete join rows first
        await prisma.projektasWorker.deleteMany({ where: { workerId: id } });

        await prisma.worker.delete({ where: { id } });

        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to delete worker" });
    }
});

export default router;
