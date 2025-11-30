"use client";

import { useEffect, useState, FormEvent } from "react";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">„Apie mus“ administravimas</h2>
          <p className="text-sm opacity-90">
            Čia gali kurti, redaguoti ir trinti „Apie mus“ sekcijos blokų tekstus.
          </p>
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
      <div className="border border-white/70 rounded-2xl overflow-hidden bg-[#22c55e]/40">
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(item)}
                        className="text-xs px-3 py-1 rounded-full bg-black/70 hover:bg-black"
                      >
                        Redaguoti
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-xs px-3 py-1 rounded-full bg-red-700 hover:bg-red-800"
                      >
                        Trinti
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FORMA */}
      <section className="border border-white/60 rounded-2xl p-4 bg-[#22c55e]/60">
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

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-black/80 hover:bg-black text-sm"
            >
              {editingId == null
                ? "Sukurti bloką"
                : "Išsaugoti pakeitimus"}
            </button>

            {editingId != null && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-1.5 rounded-full bg-white/80 hover:bg-white text-sm text-black"
              >
                Atšaukti redagavimą
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
