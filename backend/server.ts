import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

// Routers
import projektaiRouter from "./routes/projektai";

const app = express();

// --- Middleware ---
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000", credentials: true }));
app.use(express.json());

// --- Static files (optional) ---
// If Photo.url stores relative paths like "/photos/xxx.jpg" and files live in backend/uploads/photos
const photosDir = path.join(__dirname, "../uploads/photos");

app.get("/ping", (_req, res) => res.send("pong"));
app.use(
  "/photos",
  express.static(photosDir, {
    maxAge: "7d",
    immutable: true,
  })
);

// --- API routes ---
app.use("/projektai", projektaiRouter);

// --- Health check (optional but handy) ---
app.get("/health", (_req, res) => res.json({ ok: true }));

// --- Start server (only once) ---
const PORT = Number(process.env.PORT ?? 4000);
const base = process.env.PUBLIC_BASE_URL ?? `http://localhost:${PORT}`;
app.listen(PORT, () => {
  console.log(`API listening on ${base}`);
});

console.log("DATABASE_URL =", process.env.DATABASE_URL);
console.log("Listening on", process.env.PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`);



export default app;
