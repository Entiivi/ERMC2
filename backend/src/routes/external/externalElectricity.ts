import express from "express";

const router = express.Router();

// TODO: set this once you decide which endpoint you call (data.gov / Litgrid openapi / Nord Pool public JSON)
const PRICES_API_URL = process.env.ELECTRICITY_PRICES_API_URL || "";

router.get("/prices", async (req, res) => {
  try {
    if (!PRICES_API_URL) {
      return res.status(500).json({
        error:
          "Missing ELECTRICITY_PRICES_API_URL. Point it to the Nord Pool LT (EUR/MWh) API source.",
      });
    }

    // optional filters
    const date = String(req.query.date || "latest");

    // You can pass date into the provider URL if supported.
    // Example pattern: `${PRICES_API_URL}?date=${date}`
    const r = await fetch(PRICES_API_URL, { headers: { "User-Agent": "ERMC2/1.0" } });

    if (!r.ok) return res.status(502).json({ error: "Prices API failed" });

    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Unexpected error" });
  }
});

// Given kWh/month estimate, compute rough monthly cost from an average EUR/MWh
router.get("/estimate", async (req, res) => {
  try {
    const kwh = Number(req.query.kwh);
    const eurPerMwh = Number(req.query.eurPerMwh);

    if (!Number.isFinite(kwh) || !Number.isFinite(eurPerMwh)) {
      return res.status(400).json({ error: "kwh and eurPerMwh are required numbers" });
    }

    // 1 MWh = 1000 kWh
    const eurPerKwh = eurPerMwh / 1000;
    const estimated = kwh * eurPerKwh;

    res.json({ kwhPerMonth: kwh, eurPerMwh, estimatedEur: Number(estimated.toFixed(2)) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Unexpected error" });
  }
});

export default router;
