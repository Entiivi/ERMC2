import express from "express";
import proj4 from "proj4";

const router = express.Router();

const ARCGIS_BASE =
  "https://www.geoportal.lt/arcgis/rest/services/geoportal_teikeju/RC_sklypai_opendata/MapServer";

proj4.defs(
  "EPSG:3346",
  "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9998 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs"
);

// ArcGIS'e 2600 ir 3346 yra praktiškai tas pats LT TM (tik “senas” vs “latest” WKID).
const SR_TRY = [3346, 2600];

type IdentifyAttempt = {
  ok: boolean;
  wkid: number;
  resultsCount: number;
  results: any[];
  error?: string;
  raw?: string;
};

type IdentifyOut = {
  ok: true;
  point3346: { x: number; y: number };
  pickedWkid: number | null;
  item: any | null;
  resultsCount: number;
  results: any[];
  attempts: IdentifyAttempt[];
};

async function arcgisIdentify(x: number, y: number, wkid: number): Promise<IdentifyAttempt> {
  const d = 1200; // extent (metrais)
  const xmin = x - d;
  const ymin = y - d;
  const xmax = x + d;
  const ymax = y + d;

  const url =
    `${ARCGIS_BASE}/identify?f=json` +
    `&geometry=${encodeURIComponent(JSON.stringify({ x, y, spatialReference: { wkid } }))}` +
    `&geometryType=esriGeometryPoint` +
    `&sr=${wkid}` +
    `&layers=all` +
    `&tolerance=25` +
    `&mapExtent=${encodeURIComponent([xmin, ymin, xmax, ymax].join(","))}` +
    `&imageDisplay=1200,900,96` +
    `&returnGeometry=false`;

  const r = await fetch(url, {
    headers: { "User-Agent": "ERMC2/1.0 (contact: youremail@domain.lt)" },
  });

  const text = await r.text();

  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, wkid, error: "Non-JSON from ArcGIS", raw: text.slice(0, 300), resultsCount: 0, results: [] };
  }

  const results = Array.isArray(json?.results) ? json.results : [];
  return { ok: r.ok, wkid, resultsCount: results.length, results };
}

async function identifyByLatLng(lat: number, lng: number): Promise<IdentifyOut> {
  // WGS84 -> LKS94 (x,y)  (proj4 nori [lng,lat])
  const [x, y] = proj4("EPSG:4326", "EPSG:3346", [lng, lat]);

  const attempts: IdentifyAttempt[] = [];
  for (const wkid of SR_TRY) {
    const a = await arcgisIdentify(x, y, wkid);
    attempts.push(a);

    if (a.ok && a.resultsCount > 0) {
      return {
        ok: true,
        point3346: { x, y },
        pickedWkid: wkid,
        item: a.results[0] ?? null,
        resultsCount: a.resultsCount,
        results: a.results,
        attempts,
      };
    }
  }

  // nieko nerado – grąžinam debug
  return {
    ok: true,
    point3346: { x, y },
    pickedWkid: null,
    item: null,
    resultsCount: 0,
    results: [],
    attempts,
  };
}

router.get("/identify", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ ok: false, error: "lat/lng required" });
    }

    const out = await identifyByLatLng(lat, lng);
    return res.json(out);
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
});

router.get("/parcel", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ ok: false, error: "lat/lng required" });
    }

    const identify = await identifyByLatLng(lat, lng);

    const first = identify?.results?.[0] ?? null;
    const a = first?.attributes ?? null;

    if (!a) return res.json({ ok: true, item: null });

    return res.json({
      ok: true,
      item: {
        unikalusNr: a.unikalus_nr ?? null,
        kadastroNr: a.kadastro_nr ?? null,
        savivaldybe: a.sav_pavadinimas ?? null,
        plotasHa: a.skl_plotas ?? null, // string su kableliu — UI ok
        formavimoData: a.formavimo_data ?? null,
        registravimoData: a.data_rk ?? null,
      },
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
});

export default router;
