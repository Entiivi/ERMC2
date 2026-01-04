"use client";

import React, { useEffect, useMemo, useState } from "react";

type IconRow = {
  id: string;
  name: string;
  imageUrl: string;
  alt?: string | null;
  category?: string | null;
};

export function IconPicker({
  apiBase,
  value,
  onChange,
  label = "Ikona (pasirinktinai)",
}: {
  apiBase: string;
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const [icons, setIcons] = useState<IconRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ALL");

  // Build a usable URL for <img src="...">:
  // - keep absolute URLs (http/https)
  // - keep data: URLs
  // - for relative paths ("/icons/x.svg" or "icons/x.svg") prefix with apiBase
  function resolveUrl(url: string) {
    if (!url) return "";
    if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) return url;

    const base = apiBase.replace(/\/+$/, "");
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${base}${path}`;
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const qs = new URLSearchParams();
        if (q.trim()) qs.set("q", q.trim());
        if (cat !== "ALL") qs.set("category", cat);

        const res = await fetch(`${apiBase}/icons?${qs.toString()}`);
        const text = await res.text();
        if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

        const json = JSON.parse(text);
        setIcons((json.items ?? []) as IconRow[]);
      } catch (e: any) {
        setErr(e?.message ?? "Nepavyko gauti ikonų");
      } finally {
        setLoading(false);
      }
    })();
  }, [apiBase, q, cat]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    for (const i of icons) if (i.category) s.add(i.category);
    return ["ALL", ...Array.from(s).sort()];
  }, [icons]);

  const selectedIcon = useMemo(
    () => icons.find((x) => x.imageUrl === value) ?? null,
    [icons, value]
  );

  // hide selected icon from the grid; when value becomes "", it shows all again
  const visibleIcons = useMemo(() => {
    if (!value) return icons;
    return icons.filter((i) => i.imageUrl !== value);
  }, [icons, value]);

  function normalizeStoredPath(url: string) {
    if (!url) return "";
    if (url.startsWith("/uploads/icons/")) return url.replace("/uploads/icons/", "/icons/");
    return url;
  }

  return (
    <label className="text-sm md:col-span-2">
      {label}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 w-full flex items-center gap-3 rounded-md border border-black px-2 py-2 text-black text-sm bg-white"
      >
        {value ? (
          <>
            <img
              src={resolveUrl(value)}
              alt={selectedIcon?.alt ?? selectedIcon?.name ?? "Selected icon"}
              className="w-[4vw] h-[4vh] object-contain"
              onError={(e) => {
                // If the URL is wrong, hide broken image icon
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="truncate">{selectedIcon?.name ?? value}</span>
          </>
        ) : (
          <span className="text-gray-500">Pasirinkti ikoną</span>
        )}
        <span className="ml-auto text-gray-600">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="mt-2 rounded-md border border-black bg-white p-3">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Paieška..."
              className="flex-1 min-w-[180px] rounded-md border border-black px-2 py-1 text-black text-sm"
            />

            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="rounded-md border border-black px-2 py-1 text-black text-sm bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="rounded-md border border-black px-2 py-1 text-black text-sm bg-white hover:bg-gray-100"
            >
              Be ikonos
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-gray-600">Kraunama...</div>
          ) : err ? (
            <div className="text-sm text-red-600">{err}</div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-56 overflow-auto">
              {visibleIcons.map((i) => {
                const selected = value === i.imageUrl;
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => {
                      onChange(normalizeStoredPath(i.imageUrl));
                      setOpen(false);
                    }}
                    title={i.name}
                    className={[
                      "rounded-md p-1.5 border flex flex-col items-center justify-center gap-1",
                      selected ? "border-blue-600 bg-blue-50" : "border-transparent hover:bg-gray-100",
                    ].join(" ")}
                  >
                    <img
                      src={resolveUrl(i.imageUrl)}
                      alt={i.alt ?? i.name}
                      className="w-[5vw] h-[5vh] object-contain"
                    />
                    <span className="text-[10px] text-gray-700 text-center truncate w-full">
                      {i.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </label>
  );
}
