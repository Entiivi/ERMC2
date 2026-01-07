"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { ServicesPreviewPanel } from "../admin/prerview/ServicesPreviewPanel"

type Lang = "LT" | "EN";

export type Service = {
  id: string; // STRING ID, kaip Prisma
  title: string;
  subtitle: string | null;
  iconUrl: string | null;
  details: string | null;
  lang: Lang;
  order?: number | null;
};

type ServicesPanelProps = {
  apiBase: string;
};

export function ServicesPanel({ apiBase }: ServicesPanelProps) {
  const [lang, setLang] = useState<Lang>("LT");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [details, setDetails] = useState("");
  const [order, setOrder] = useState<number | "">("");

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSubtitle("");
    setIconUrl("");
    setDetails("");
    setOrder("");
  };

  const fetchServices = async (currentLang: Lang) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiBase}/services?lang=${currentLang}`);
      if (!res.ok) {
        throw new Error(`Serverio klaida: ${res.status}`);
      }

      const data = (await res.json()) as Service[];
      setServices(data);
    } catch (err: any) {
      console.error("Nepavyko gauti paslaugų:", err);
      setError(err?.message ?? "Nepavyko gauti paslaugų");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(lang);
  }, [lang]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Pavadinimas (title) privalomas");
      return;
    }

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      iconUrl: iconUrl.trim() || null,
      details: details.trim() || null,
      lang,
      order: order === "" ? undefined : Number(order),
    };

    try {
      setError(null);

      if (editingId == null) {
        // CREATE
        const res = await fetch(`${apiBase}/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko sukurti paslaugos (status ${res.status})`
          );
        }
      } else {
        // UPDATE
        const res = await fetch(`${apiBase}/services/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko atnaujinti paslaugos (status ${res.status})`
          );
        }
      }

      resetForm();
      await fetchServices(lang);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err?.message ?? "Nepavyko išsaugoti");
    }
  };

  const handleEditClick = (service: Service) => {
    setEditingId(service.id);
    setTitle(service.title ?? "");
    setSubtitle(service.subtitle ?? "");
    setIconUrl(service.iconUrl ?? "");
    setDetails(service.details ?? "");
    setOrder(
      typeof service.order === "number" && !Number.isNaN(service.order)
        ? service.order
        : ""
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai ištrinti šią paslaugą?")) return;

    try {
      setError(null);
      const res = await fetch(`${apiBase}/services/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Nepavyko ištrinti (status ${res.status})`);
      }

      await fetchServices(lang);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err?.message ?? "Nepavyko ištrinti paslaugos");
    }
  };

  const [previewOpen, setPreviewOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!previewOpen) return;

    const t = window.setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 320);

    return () => window.clearTimeout(t);
  }, [previewOpen]);

  const actionBtn =
    "[all:unset] inline-flex bg-transparent border-none outline-none appearance-none px-6 py-3 !cursor-pointer select-none transition-transform duration-200 hover:scale-105 hover:text-[#14b8a6]";

  const dangerBtnSm =
    "text-xs px-3 py-1 cursor-pointer select-none transition-transform duration-200 hover:scale-105 hover:text-[#ef4444]";

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Paslaugos</h2>
        </div>

        {/* kalbos pasirinkimas */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Kalba:</span>
          <select
            value={lang}
            onChange={(e) => {
              const newLang = e.target.value === "EN" ? "EN" : "LT";
              setLang(newLang);
              resetForm();
            }}
            className="text-black text-sm rounded-md px-2 py-1"
          >
            <option value="LT">LT</option>
            <option value="EN">EN</option>
          </select>
        </div>
      </header>

      {/* ERROR / LOADING */}
      {error && (
        <div className="border border-red-500 bg-red-700/60 text-white text-sm rounded-xl px-3 py-2">
          Klaida: {error}
        </div>
      )}

      {/* LENTELĖ */}
      <div className="rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/20">
            <tr className="text-left">
              <th className="px-3 py-2 border-b border-white/40 w-[35%]">
                Pavadinimas
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[25%]">
                Sub-tekstas
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[20%]">
                Ikona
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[10%]">
                Eilė
              </th>
              <th className="px-3 py-2 border-b border-white/40">Veiksmai</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center">
                  Kraunama...
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center">
                  Paslaugų nėra. Pridėk pirmą įrašą žemiau esančioje formoje.
                </td>
              </tr>
            ) : (
              services.map((s) => (
                <tr key={s.id} className="odd:bg-white/5 even:bg-white/0">
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="font-semibold">{s.title}</div>
                    {s.details && (
                      <div className="text-xs opacity-90 line-clamp-2">
                        {s.details}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {s.subtitle || (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {s.iconUrl ? (
                      <span className="break-all text-xs">{s.iconUrl}</span>
                    ) : (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {typeof s.order === "number" ? s.order : (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="flex flex-wrap gap-2">
                      <a
                        type="button"
                        onClick={() => handleEditClick(s)}
                        className={actionBtn}
                      >
                        Redaguoti
                      </a>
                      <a
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className={dangerBtnSm}
                      >
                        Trinti
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FORMA: Add / Edit */}
      <section className="rounded-2xl p-4">
        <h3 className="text-lg font-semibold mb-2">
          {editingId == null ? "Pridėti naują paslaugą" : "Redaguoti paslaugą"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm">
              Pavadinimas *
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                required
              />
            </label>

            <label className="text-sm">
              Sub-tekstas
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
              />
            </label>

            <label className="text-sm">
              Ikonos URL
              <input
                type="text"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="https://..."
              />
            </label>

            <label className="text-sm">
              Eilės numeris (order)
              <input
                type="number"
                value={order}
                onChange={(e) =>
                  setOrder(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="0"
              />
            </label>

            <label className="text-sm md:col-span-2">
              Detalės / aprašymas
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm h-24 resize-vertical"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-[1.5vw] pt-2">
            <a
              type="submit"
              className="hover:scale-105 hover:text-[#14b8a6] transition-transform duration-200 pt-2 flex items-center gap-2 cursor-pointer select-none"
            >
              {editingId == null ? "Sukurti paslaugą" : "Išsaugoti pakeitimus"}
            </a>

            {editingId != null && (
              <a
                type="button"
                onClick={resetForm}
                className={dangerBtnSm}
              >
                Atšaukti redagavimą
              </a>
            )}

            <a
              type="button"
              onClick={() => setPreviewOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-black/10 transition"
              aria-label="Toggle projektų peržiūra"
            >
              <div className="hover:scale-105 hover:text-[#14b8a6] transition-transform duration-200 pt-2 flex items-center gap-2 cursor-pointer select-none">
                <span>
                  Peržiūra
                </span>
                <span
                  className={`block scale-150 transition-transform duration-200 ${previewOpen ? "rotate-180" : ""
                    }`}
                >
                  ▾
                </span>
              </div>

            </a>
          </div>
        </form>
      </section>
      <div
        className={[
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out",
          previewOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0",
        ].join(" ")}
      >
        <div className="min-h-0 overflow-hidden">
          <ServicesPreviewPanel key={lang} lang={lang} />
        </div>
      </div>
    </div>
  );
}
