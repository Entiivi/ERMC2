"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { FullProjectDTO } from "@/app/lib/api";

type PhotoRef = { id: string; caption: string | null; href: string; original?: string };

type Props = {
  selected: FullProjectDTO | null;
  imgIdx: number;
  setImgIdx: (i: number) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/* ---------- small tile with debug overlay ---------- */
function CardTile({
  index,
  photo,
  onClick,
  showDebugOverlay,
}: {
  index: number;
  photo: PhotoRef;
  onClick: () => void;
  showDebugOverlay: boolean;
}) {
  const wrapperRef = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current) return;
    const r = wrapperRef.current.getBoundingClientRect();
    console.log(
      `[Tile ${index}] size: ${Math.round(r.width)}x${Math.round(r.height)} visible=${r.width > 0 && r.height > 0}`,
    );
  }, []);

  // cache-bust for dev only (optional)
  const busted = `${photo.href}${photo.href.includes("?") ? "&" : "?"}cb=${Date.now()}`;

  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        window.open(busted, "_blank", "noopener,noreferrer");
      }}
      className="relative transition focus:outline-none focus:ring-2 focus:ring-offset-2"
      aria-label={`Atidaryti nuotrauką #${index + 1}`}
      ref={wrapperRef}
      style={{
        width: "100%",
        paddingTop: "100%",
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",
        background: "repeating-conic-gradient(#e5e5e5 0% 25%, #f8f8f8 0% 50%) 50% / 16px 16px",
        border: "2px solid rgba(0,0,0,0.15)",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 8,
          top: 8,
          fontSize: 10,
          background: "rgba(255,255,255,0.9)",
          padding: "2px 6px",
          borderRadius: 6,
          zIndex: 2,
        }}
      >
        #{index + 1}
      </span>

      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08), inset 0 0 24px rgba(0,0,0,0.12)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <Image
        src={busted}                // <-- uses backend streaming endpoint
        alt={photo.caption ?? ""}
        fill
        sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw"
        priority={index < 4}
        style={{ objectFit: "cover", objectPosition: "center", display: "block" }}
        onLoad={() => console.log(`[IMG] painted: ${busted}`)}
        onError={(e) => console.error(`[IMG] error: ${busted}`, e)}
      />

      {showDebugOverlay && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "6px 8px",
            fontSize: 12,
            lineHeight: 1.2,
            textAlign: "center",
            color: "#111",
            background: "rgba(255,255,255,0.85)",
            zIndex: 3,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
          title={photo.href}
        >
          {photo.href}
        </div>
      )}
    </button>
  );
}

/* ---------- modal ---------- */
export default function PatirtisModalExpanded({
  selected,
  imgIdx,
  setImgIdx,
  onClose,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [showDebugOverlay, setShowDebugOverlay] = useState(true);
  const [photos, setPhotos] = useState<PhotoRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);



  // Fetch photos from backend GET /projektai/:id/fotos
  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setErr(null);
    console.log(`[Modal] fetching photos for projektas ${selected.id}`);

    const url = `${API}/projektai/${selected.id}/fotos`;
      console.log("[Modal] fetching:", url);
    fetch(url, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as { photos: PhotoRef[] };
        console.log("[Modal] API photos:", data.photos);
        setPhotos(data.photos);
      })
      .catch((e) => {
        console.error("[Modal] photos fetch failed:", e);
        setErr(String(e));
      })
      .finally(() => setLoading(false));
  }, [selected]);

  // Debug toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d") setShowDebugOverlay((v) => !v);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted || !selected) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0"
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 2147483646 }}
        onClick={onClose}
      />

      {/* Centered modal container */}
      <div
        className="fixed inset-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="proj-title"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2147483647,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3vw",
        }}
        onClick={onClose}
      >
        {/* Panel */}
        <div
          style={{
            position: "relative",
            backgroundColor: "#e7e7e7",
            borderRadius: "1.25rem",
            padding: "2rem",
            width: "min(1200px, 96vw)",
            maxHeight: "90vh",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Uždaryti"
            style={{
              position: "absolute",
              right: 16,
              top: 16,
              zIndex: 2,
              background: "white",
              border: "1px solid rgba(0,0,0,0.15)",
              borderRadius: 9999,
              padding: "2px 10px",
              lineHeight: 1.4,
              cursor: "pointer",
            }}
          >
            ✕
          </button>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg overflow-y-auto" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px" }}>
            <div className="mb-4">
              <time className="text-xs text-gray-500 mb-1 block">
                {new Date(selected.date).toLocaleDateString("lt-LT", { day: "numeric", month: "long", year: "numeric" })}
              </time>
              <h2 id="proj-title" className="text-center font-semibold text-gray-900">
                {selected.title}
              </h2>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 md:p-6 mb-6">
              <div className="text-sm md:text-base leading-6 text-gray-800 whitespace-pre-wrap text-center">
                {selected.description ?? selected.excerpt ?? "Aprašymo nėra"}
              </div>
            </div>

            <div className="mb-3 flex items-end justify-between">
              <h3 className="text-sm font-medium text-gray-900">Nuotraukos</h3>
              <div className="text-xs text-gray-500">
                Debug overlay: {showDebugOverlay ? "ON (press D to toggle)" : "OFF (press D)"}
              </div>
            </div>

            {/* Photos grid from backend GET */}
            {loading ? (
              <div className="w-full py-16 text-center text-sm text-gray-600">Įkeliamos nuotraukos…</div>
            ) : err ? (
              <div className="w-full py-10 text-center text-sm text-red-600">Klaida įkeliant nuotraukas: {err}</div>
            ) : photos.length > 0 ? (
              <div className="grid gap-[1vw] grid-cols-3 sm:grid-cols-3 md:grid-cols-4" style={{ minHeight: 200 }}>
                {photos.map((p, i) => (
                  <CardTile
                    key={p.id}
                    index={i}
                    photo={p}
                    showDebugOverlay={showDebugOverlay}
                    onClick={() => {
                      console.log(`[Modal] Clicked photo #${i + 1}`, p.href);
                      setImgIdx(i);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full py-10 text-center text-sm text-gray-500">Nėra nuotraukų</div>
            )}

            {selected.link && (
              <div className="pt-8">
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-gray-100"
                >
                  Apsilankyti projekte <span aria-hidden>↗</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
