"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ProjectLocationMap = dynamic(
  () => import("./LocationMap").then((m) => m.ProjectLocationMap),
  { ssr: false }
);

type LocationItem = {
  id: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
};

type ParcelItem = {
  unikalusNr: string | null;
  kadastroNr: string | null;
  savivaldybe: string | null;
  plotasHa: string | null;
  formavimoData: string | null;
  registravimoData: string | null;
};

export function SectionLocation({
  apiBase,
  projektasId,
}: {
  apiBase: string;
  projektasId: string;
}) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [address, setAddress] = useState<string>("");

  const [parcel, setParcel] = useState<ParcelItem | null>(null);

  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);

  // load existing
  useEffect(() => {
    let alive = true;

    (async () => {
      const r = await fetch(`${apiBase}/projects/${projektasId}/location`)
        .then((x) => x.json())
        .catch(() => null);

      const item: LocationItem | null = r?.item ?? null;
      if (!alive || !item) return;

      setLat(item.lat ?? null);
      setLng(item.lng ?? null);
      setAddress(item.address ?? "");

      if (item.lat != null && item.lng != null) {
        const rc = await fetch(`${apiBase}/rc/parcel?lat=${item.lat}&lng=${item.lng}`)
          .then((x) => x.json())
          .catch(() => null);
        if (!alive) return;
        setParcel(rc?.item ?? null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [apiBase, projektasId]);

  async function saveLocation(next: { lat: number | null; lng: number | null; address: string }) {
    setSaving(true);
    try {
      const addressForDb = next.address.trim() === "" ? null : next.address.trim();

      const resp = await fetch(`${apiBase}/projects/${projektasId}/location`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: next.lat,
          lng: next.lng,
          address: addressForDb,
        }),
      }).then((r) => r.json());

      if (resp?.ok && resp?.item) {
        setLat(resp.item.lat ?? null);
        setLng(resp.item.lng ?? null);
        setAddress(resp.item.address ?? "");
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveParcelToDb(p: ParcelItem | null) {
    const body = p
      ? {
          rcUnikalusNr: p.unikalusNr,
          rcKadastroNr: p.kadastroNr,
          rcSavivaldybe: p.savivaldybe,
          rcPlotasHa: p.plotasHa,
          rcFormavimoData: p.formavimoData,
          rcRegistravimoData: p.registravimoData,
        }
      : {
          rcUnikalusNr: null,
          rcKadastroNr: null,
          rcSavivaldybe: null,
          rcPlotasHa: null,
          rcFormavimoData: null,
          rcRegistravimoData: null,
        };

    await fetch(`${apiBase}/projects/${projektasId}/rc`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  return (
    <div className="rounded-2xl bg-white p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-black">Projekto vieta</div>
        <div className="text-xs text-black/60">
          {lat != null && lng != null ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "–"}{" "}
          {picking ? "• Kraunama..." : saving ? "• Saugoma..." : ""}
        </div>
      </div>

      {pickError && <div className="text-xs text-red-600">{pickError}</div>}

      <ProjectLocationMap
        lat={lat}
        lng={lng}
        onPick={async (a, b) => {
          setPickError(null);
          setPicking(true);

          try {
            setLat(a);
            setLng(b);

            const rev = await fetch(`${apiBase}/geo/reverse?lat=${a}&lng=${b}`)
              .then((x) => x.json())
              .catch(() => null);

            const displayName: string | null = rev?.item?.displayName ?? null;
            const nextAddress = (displayName ?? address).trim();
            if (displayName) setAddress(displayName);

            await saveLocation({ lat: a, lng: b, address: nextAddress });

            const rc = await fetch(`${apiBase}/rc/parcel?lat=${a}&lng=${b}`)
              .then((x) => x.json())
              .catch(() => null);

            const p: ParcelItem | null = rc?.item ?? null;
            setParcel(p);
            await saveParcelToDb(p);
          } finally {
            setPicking(false);
          }
        }}
      />

      {/* RC info */}
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <div className="font-semibold mb-1">Sklypo info (RC)</div>
        {parcel ? (
          <>
            <div>Unikalus Nr: {parcel.unikalusNr ?? "–"}</div>
            <div>Kadastro Nr: {parcel.kadastroNr ?? "–"}</div>
            <div>Savivaldybė: {parcel.savivaldybe ?? "–"}</div>
            <div>Plotas (ha): {parcel.plotasHa ?? "–"}</div>
          </>
        ) : (
          <div className="text-black/60">–</div>
        )}
      </div>

      <label className="text-sm block">
        Adresas
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
          placeholder="Pvz. Gedimino pr. 1, Vilnius"
        />
      </label>

      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          className="px-3 py-1.5 rounded-md bg-gray-100 text-sm hover:bg-gray-200"
          onClick={async () => {
            await saveLocation({ lat, lng, address });
          }}
        >
          Išsaugoti
        </button>

        <button
          type="button"
          className="px-3 py-1.5 rounded-md bg-gray-100 text-sm hover:bg-gray-200"
          onClick={async () => {
            setLat(null);
            setLng(null);
            setAddress("");
            setParcel(null);

            await saveLocation({ lat: null, lng: null, address: "" });
            await saveParcelToDb(null);
          }}
        >
          Išvalyti (ir RC)
        </button>
      </div>
    </div>
  );
}
