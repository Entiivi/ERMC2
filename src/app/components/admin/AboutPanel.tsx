"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { ApiePreviewPanel } from "../admin/prerview/ApiePreviewPanel"
type Lang = "LT" | "EN";

type AboutItem = {
  id: string;
  lang: Lang;
  title: string;
  content: string;
  order?: number | null;
};

type AboutPanelProps = {
  apiBase: string;
};

export function AboutPanel({ apiBase }: AboutPanelProps) {
  const [lang, setLang] = useState<Lang>("LT");
  const [items, setItems] = useState<AboutItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState<number | "">("");

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setOrder("");
  };

  const fetchAbout = async (currentLang: Lang) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiBase}/apie?lang=${currentLang}`);
      if (!res.ok) {
        throw new Error(`Serverio klaida: ${res.status}`);
      }

      const data = (await res.json()) as AboutItem[];
      setItems(data);
    } catch (err: any) {
      console.error("Nepavyko gauti 'Apie mus' įrašų:", err);
      setError(err?.message ?? "Nepavyko gauti 'Apie mus' įrašų");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout(lang);
  }, [lang]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!previewOpen) return;

    const t = window.setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 320);

    return () => window.clearTimeout(t);
  }, [previewOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Pavadinimas (title) privalomas");
      return;
    }
    if (!content.trim()) {
      alert("Turinys (content) privalomas");
      return;
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      lang,
      order: order === "" ? undefined : Number(order),
    };

    try {
      setError(null);

      if (editingId == null) {
        // CREATE
        const res = await fetch(`${apiBase}/apie`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko sukurti įrašo (status ${res.status})`
          );
        }
      } else {
        // UPDATE
        const res = await fetch(`${apiBase}/apie/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko atnaujinti įrašo (status ${res.status})`
          );
        }
      }

      resetForm();
      await fetchAbout(lang);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err?.message ?? "Nepavyko išsaugoti 'Apie mus' įrašo");
    }
  };

  const handleEditClick = (item: AboutItem) => {
    setEditingId(item.id);
    setTitle(item.title ?? "");
    setContent(item.content ?? "");
    setOrder(
      typeof item.order === "number" && !Number.isNaN(item.order)
        ? item.order
        : ""
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai ištrinti šį 'Apie mus' įrašą?")) return;

    try {
      setError(null);
      const res = await fetch(`${apiBase}/apie/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || `Nepavyko ištrinti įrašo (status ${res.status})`
        );
      }

      await fetchAbout(lang);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err?.message ?? "Nepavyko ištrinti 'Apie mus' įrašo");
    }
  };



  const actionBtn =
    "px-6 py-3 cursor-pointer select-none transition-transform duration-200 hover:scale-105 hover:text-[#14b8a6]";

  const dangerBtnSm =
    "text-xs px-3 py-1 cursor-pointer select-none transition-transform duration-200 hover:scale-105 hover:text-[#ef4444]";

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Apie mus</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Kalba:</span>
          <select
            value={lang}
            onChange={(e) => {
              const newLang = e.target.value === "EN" ? "EN" : "LT";
              setLang(newLang);
              resetForm();
            }}
            className="text-black text-sm rounded-md px-2 py-1 border border-black"
          >
            <option value="LT">LT</option>
            <option value="EN">EN</option>
          </select>
        </div>
      </header>

      {/* Error */}
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
              <th className="px-3 py-2 border-b border-white/40 w-[20%]">
                Pavadinimas
              </th>
              <th className="px-3 py-2 border-b border-white/40">
                Turinys
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[8%]">
                Eilė
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[18%]">
                Veiksmai
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center">
                  Kraunama...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center">
                  Įrašų nėra. Pridėk pirmą bloką žemiau esančioje formoje.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="odd:bg-white/5 even:bg-white/0">
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="font-semibold">{item.title}</div>
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="text-xs whitespace-pre-wrap">
                      {item.content}
                    </div>
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {typeof item.order === "number" ? (
                      item.order
                    ) : (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="flex flex-wrap gap-[1vw]">
                      <a
                        type="button"
                        onClick={() => handleEditClick(item)}
                        className={actionBtn}
                      >
                        Redaguoti
                      </a>
                      <a
                        type="button"
                        onClick={() => handleDelete(item.id)}
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

      {/* FORMA */}
      <section className="rounded-2xl p-4 pl-[1vw]">
        <h3 className="text-lg font-semibold mb-2">
          {editingId == null
            ? "Pridėti naują „Apie mus“ bloką"
            : "Redaguoti „Apie mus“ bloką"}
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
              Eilės numeris (order)
              <input
                type="number"
                value={order}
                onChange={(e) =>
                  setOrder(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="0"
              />
            </label>

            <label className="text-sm md:col-span-2">
              Turinys *
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm h-40 resize-vertical"
                placeholder="Aprašykite įmonę, patirtį, tikslus ir t.t."
                required
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-[1vw] pt-2">
            <a
              type="submit"
              className={actionBtn}
            >
              {editingId == null
                ? "Sukurti bloką"
                : "Išsaugoti pakeitimus"}
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
      <div ref={previewRef}
        className="scroll-mt-[100vh]"
      >
        <div
          className={[
            "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out",
            previewOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0",
          ].join(" ")}
        >
          <div className="min-h-0 overflow-hidden">
            <ApiePreviewPanel lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
