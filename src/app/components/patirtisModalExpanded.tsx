"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { FullProjectDTO } from "@/app/lib/api";

type PhotoRef = {
  id: string;
  caption: string | null;
  href: string;     // API href to stream image
  original: string; // original URL stored in DB
};

type Props = {
  selected: FullProjectDTO | null;
  setImgIdx: (i: number) => void; // paliekamas tipe, bet nebenaudojamas
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/* ---------- small tile (hover only) ---------- */
function CardTile({ photo }: { photo: PhotoRef }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={wrapperRef}
      className="relative overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-lg"
      style={{
        width: "100%",
        paddingTop: "100%",
        position: "relative",
        borderRadius: "1rem",
        background:
          "repeating-conic-gradient(#e5e5e5 0% 25%, #f8f8f8 0% 50%) 50% / 16px 16px",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Image
        src={photo.href}
        alt={photo.caption ?? ""}
        fill
        sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw"
        style={{
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
          transition: "transform 0.3s ease",
          borderRadius: "1rem" 
        }}
        unoptimized
      />
      {/* Optional overlay fade on hover */}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
    </div>
  );
}

/* ---------- modal ---------- */
export default function PatirtisModalExpanded({
  selected,
  setImgIdx, // unused
  onClose,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [photos, setPhotos] = useState<PhotoRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // Fetch photos from backend GET /projektai/:id/fotos
  useEffect(() => {
    if (!selected) return;
    let alive = true;

    setLoading(true);
    setErr(null);
    const url = `${API}/projektai/${selected.id}/fotos`;

    fetch(url, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as { photos: PhotoRef[] };
        if (alive) setPhotos(data.photos);
      })
      .catch((e) => {
        if (alive) setErr(String(e));
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [selected]);

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "escape") onClose();
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
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          zIndex: 2147483646,
        }}
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
          <div
            className="bg-white rounded-xl shadow-lg overflow-y-auto"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "24px",
            }}
          >
            <div className="mb-4">
              <time className="text-xs text-gray-500 mb-1 block">
                {new Date(selected.date).toLocaleDateString("lt-LT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              <h2
                id="proj-title"
                className="text-center font-semibold text-gray-900"
              >
                {selected.title}
              </h2>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 md:p-6 mb-6">
              <div className="text-sm md:text-base leading-6 text-gray-800 whitespace-pre-wrap text-center">
                {selected.excerpt ?? "Aprašymo nėra"}
              </div>
            </div>

            <div className="mb-3 flex items-end justify-between">
              <h3 className="text-sm font-medium text-gray-900">Nuotraukos</h3>
            </div>

            {/* Photos grid */}
            {loading ? (
              <div className="w-full py-16 text-center text-sm text-gray-600">
                Įkeliamos nuotraukos…
              </div>
            ) : err ? (
              <div className="w-full py-10 text-center text-sm text-red-600">
                Klaida įkeliant nuotraukas: {err}
              </div>
            ) : photos.length > 0 ? (
              <div
                className="grid gap-[1vw] grid-cols-3 sm:grid-cols-3 md:grid-cols-4"
                style={{ minHeight: 200 }}
              >
                {photos.map((p) => (
                  <CardTile key={p.id} photo={p} />
                ))}
              </div>
            ) : (
              <div className="w-full py-10 text-center text-sm text-gray-500">
                Nėra nuotraukų
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
