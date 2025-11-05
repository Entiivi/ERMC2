import { Router } from "express";
import { prisma } from "../prisma";

const r = Router();

/** ----- PROJECTS ----- */

// GET /admin/projects
r.get("/projects", async (_req, res) => {
  try {
    const projects = await prisma.projektas.findMany({
      orderBy: { date: "desc" }, // adjust field name
    });
    res.json(projects);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// DELETE /admin/projects/:id
r.delete("/projects/:id", async (req, res) => {
  try {
    await prisma.projektas.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

/** ----- CV / APPLICATIONS (Paraiska) ----- */

// GET /admin/paraiskos
r.get("/paraiskos", async (_req, res) => {
  try {
    const rows = await prisma.paraiska.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// DELETE /admin/paraiskos/:id
r.delete("/paraiskos/:id", async (req, res) => {
  try {
    await prisma.paraiska.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete application" });
  }
});

r.post("/projects", async (req, res) => {
  try {
    const { title, date, cover, excerpt, link, tech, tags } = req.body;
    if (!title || !date) return res.status(400).json({ error: "title and date are required" });

    const project = await prisma.projektas.create({
      data: {
        title,
        date: new Date(date),
        cover,
        excerpt,
        link,
        tech,
        tags,
      },
    });

    res.status(201).json(project);
  } catch (e) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

r.put("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, cover, excerpt, link, tech, tags } = req.body;

    const project = await prisma.projektas.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(cover !== undefined && { cover }),
        ...(excerpt !== undefined && { excerpt }),
        ...(link !== undefined && { link }),
        ...(tech !== undefined && { tech }),
        ...(tags !== undefined && { tags }),
      },
    });

    res.json(project);
  } catch (e) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

r.post("/paraiskos", async (req, res) => {
  try {
    const { name, email, phone, position, cvUrl, message } = req.body;
    if (!name || !email || !position)
      return res.status(400).json({ error: "name, email and position are required" });

    const paraiska = await prisma.paraiska.create({
      data: { name, email, phone, position, cvUrl, message },
    });

    res.status(201).json(paraiska);
  } catch (e) {
    res.status(500).json({ error: "Failed to create application" });
  }
});

r.patch("/paraiskos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, internalNote, readAt } = req.body;

    const paraiska = await prisma.paraiska.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(internalNote && { internalNote }),
        ...(readAt && { readAt: new Date(readAt) }),
      },
    });

    res.json(paraiska);
  } catch (e) {
    res.status(500).json({ error: "Failed to update application" });
  }
});


export default r;
