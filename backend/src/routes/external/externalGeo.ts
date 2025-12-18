import express from "express";

const router = express.Router();

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

// Simple in-memory cache (ok for dev). In prod use Redis/db.
const cache = new Map<string, { ts: number; data: any }>();
const TTL_MS = 1000 * 60 * 60 * 24; // 24h

function getCached(key: string) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL_MS) return hit.data;
  return null;
}

function setCached(key: string, data: any) {
  cache.set(key, { ts: Date.now(), data });
}

router.get("/geocode", async (req, res) => {
  try {
    const address = String(req.query.address || "").trim();
    if (!address) return res.status(400).json({ error: "address is required" });

    const key = `geocode:${address}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < TTL_MS) return res.json(hit.data);

    // Lithuania-only bias:
    const url =
      `${NOMINATIM_BASE}/search?format=jsonv2` +
      `&q=${encodeURIComponent(address)}` +
      `&countrycodes=lt&limit=1`;

    const r = await fetch(url, {
      headers: {
        // REQUIRED: identify your app (don't leave default)
        "User-Agent": "ERMC2/1.0 (contact: youremail@domain.lt)",
      },
    });

    if (!r.ok) return res.status(502).json({ error: "Geocoding failed" });

    const data = await r.json();

    const out =
      Array.isArray(data) && data.length
        ? {
            lat: Number(data[0].lat),
            lng: Number(data[0].lon),
            displayName: data[0].display_name,
          }
        : null;

    cache.set(key, { ts: Date.now(), data: out });
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Unexpected error" });
  }
});

// GET /projects/geo/reverse?lat=...&lng=...
router.get("/reverse", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ ok: false, error: "lat/lng required" });
    }

    const key = `r:${lat.toFixed(6)}:${lng.toFixed(6)}`;
    const cached = getCached(key);
    if (cached) return res.json({ ok: true, item: cached });

    const url =
      `${NOMINATIM_BASE}/reverse?format=jsonv2` +
      `&lat=${encodeURIComponent(String(lat))}` +
      `&lon=${encodeURIComponent(String(lng))}` +
      `&zoom=18&addressdetails=1`;

    const r = await fetch(url, {
      headers: { "User-Agent": "ERMC2/1.0 (contact: youremail@domain.lt)" },
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: "Reverse geocode failed" });

    const data: any = await r.json();
    const out = data?.display_name ? { displayName: String(data.display_name) } : null;

    setCached(key, out);
    res.json({ ok: true, item: out });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
});

export default router;
