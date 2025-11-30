"use client";

import { useEffect, useState, FormEvent } from "react";

type Lang = "LT" | "EN";

export type Project = {
  id: string;
  title: string;
  date: string;         // ISO string iš backend
  cover: string;
  logoUrl?: string;
  tech: any[];          // backend gražina Json, mes rodysim kaip stringus
  tags: string[];
  excerpt?: string;
  link?: string;
  client?: string | null;
};

type ProjectsPanelProps = {
  apiBase: string;
};

export function ProjectsPanel({ apiBase }: ProjectsPanelProps) {
  const [lang, setLang] = useState<Lang>("LT");
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filtrai
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | "ALL">("ALL");

  // forma
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [dateStr, setDateStr] = useState(""); // YYYY-MM-DD
  const [cover, setCover] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [link, setLink] = useState("");
  const [techText, setTechText] = useState(""); // tech kaip "React, Node, Prisma"
  const [tagsText, setTagsText] = useState(""); // tags kaip "Elektromontavimas, Pramonė"

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setClient("");
    setDateStr("");
    setCover("");
    setLogoUrl("");
    setExcerpt("");
    setLink("");
    setTechText("");
    setTagsText("");
  };

  const fetchProjects = async (currentLang: Lang) => {
    try {
      setLoading(true);
      setError(null);

      // svarbu: tavo route yra /projektai
      const res = await fetch(`${apiBase}/projektai?lang=${currentLang}`);
      if (!res.ok) {
        throw new Error(`Serverio klaida: ${res.status}`);
      }

      const json = await res.json();
      const data = (json.projects ?? []) as Project[];
      const tags = (json.tags ?? []) as string[];

      setProjects(data);
      setAvailableTags(tags);
    } catch (err: any) {
      console.error("Nepavyko gauti projektų:", err);
      setError(err?.message ?? "Nepavyko gauti projektų");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(lang);
  }, [lang]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Pavadinimas (title) privalomas");
      return;
    }
    if (!cover.trim()) {
      alert("Viršelio kelias (cover) privalomas");
      return;
    }

    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const tech = techText
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: title.trim(),
      client: client.trim() || undefined,
      date: dateStr || undefined,
      cover: cover.trim(),
      logoUrl: logoUrl.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      link: link.trim() || undefined,
      tech,
      tags,
      lang,
    };

    try {
      setError(null);

      if (editingId == null) {
        // CREATE
        const res = await fetch(`${apiBase}/projektai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko sukurti projekto (status ${res.status})`
          );
        }
      } else {
        // UPDATE
        const res = await fetch(`${apiBase}/projektai/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko atnaujinti projekto (status ${res.status})`
          );
        }
      }

      resetForm();
      await fetchProjects(lang);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err?.message ?? "Nepavyko išsaugoti projekto");
    }
  };

  const handleEditClick = (p: Project) => {
    setEditingId(p.id);
    setTitle(p.title ?? "");
    setClient(p.client ?? "");
    setCover(p.cover ?? "");
    setLogoUrl(p.logoUrl ?? "");
    setExcerpt(p.excerpt ?? "");
    setLink(p.link ?? "");
    setTechText(
      Array.isArray(p.tech)
        ? p.tech
          .map((x) =>
            typeof x === "string" ? x : JSON.stringify(x)
          )
          .join(", ")
        : ""
    );
    setTagsText(p.tags?.join(", ") ?? "");

    // data iš ISO -> YYYY-MM-DD
    if (p.date) {
      try {
        const d = new Date(p.date);
        if (!Number.isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          setDateStr(`${year}-${month}-${day}`);
        } else {
          setDateStr("");
        }
      } catch {
        setDateStr("");
      }
    } else {
      setDateStr("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai ištrinti šį projektą?")) return;

    try {
      setError(null);

      const res = await fetch(`${apiBase}/projektai/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || `Nepavyko ištrinti projekto (status ${res.status})`
        );
      }

      await fetchProjects(lang);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err?.message ?? "Nepavyko ištrinti projekto");
    }
  };

  // Filtruojam client-side
  const filteredProjects = projects
    .filter((p) =>
      tagFilter === "ALL" ? true : p.tags?.includes(tagFilter)
    )
    .filter((p) => {
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.client ?? "").toLowerCase().includes(q) ||
        (p.excerpt ?? "").toLowerCase().includes(q)
      );
    });

  const formatDate = (iso: string | undefined) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("lt-LT");
  };

  return (
    <div className="space-y-6">
      {/* HEADER + filtrai */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Projektų administravimas</h2>
          <p className="text-sm opacity-90">
            Čia gali pridėti, redaguoti ir tvarkyti ERMC projektus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Paieška pagal pavadinimą, klientą ar aprašymą…"
            className="rounded-full border border-black px-3 py-1.5 text-sm text-black min-w-[200px]"
          />

          <select
            value={tagFilter}
            onChange={(e) =>
              setTagFilter(e.target.value === "ALL" ? "ALL" : e.target.value)
            }
            className="rounded-full border border-black px-3 py-1.5 text-sm text-black"
          >
            <option value="ALL">Visos žymos</option>
            {availableTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={lang}
            onChange={(e) => {
              const newLang = e.target.value === "EN" ? "EN" : "LT";
              setLang(newLang);
              resetForm();
            }}
            className="rounded-full border border-black px-3 py-1.5 text-sm text-black"
          >
            <option value="LT">LT</option>
            <option value="EN">EN</option>
          </select>
        </div>
      </header>

      {/* ERROR */}
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
              <th className="px-3 py-2 border-b border-white/40 w-[32%]">
                Projektas
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[18%]">
                Klientas
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[18%]">
                Data
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[18%]">
                Žymos
              </th>
              <th className="px-3 py-2 border-b border-white/40">
                Veiksmai
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center">
                  Kraunama...
                </td>
              </tr>
            ) : filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center">
                  Projektų nėra. Pabandyk pakeisti filtrus arba pridėti naują
                  projektą žemiau.
                </td>
              </tr>
            ) : (
              filteredProjects.map((p) => (
                <tr key={p.id} className="odd:bg.white/5 even:bg-white/0">
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="font-semibold mb-1">{p.title}</div>
                    {p.excerpt && (
                      <div className="text-xs opacity-90 line-clamp-3">
                        {p.excerpt}
                      </div>
                    )}
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] underline opacity-90"
                      >
                        Projekto nuoroda
                      </a>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {p.client || (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {formatDate(p.date) || (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {p.tags && p.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {p.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] uppercase tracking-wide bg-black/30 rounded-full px-2 py-[2px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(p)}
                        className="text-xs px-3 py-1 rounded-full bg-black/70 hover:bg-black"
                      >
                        Redaguoti
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
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
            ? "Pridėti naują projektą"
            : "Redaguoti projektą"}
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
              Klientas
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
              />
            </label>

            <label className="text-sm">
              Data
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
              />
            </label>

            <label className="text-sm">
              Cover kelias *
              <input
                type="text"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="/uploads/photos/projektas1.jpg"
                required
              />
            </label>

            <label className="text-sm">
              Logo URL (pasirinktinai)
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="/logos/client.svg"
              />
            </label>

            <label className="text-sm">
              Projekto nuoroda (pvz. atskiras puslapis)
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="https://..."
              />
            </label>

            <label className="text-sm md:col-span-2">
              Trumpas aprašymas (excerpt)
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm h-24 resize-vertical"
              />
            </label>

            <label className="text-sm md:col-span-2">
              Technologijos (tech), atskirtos kableliais
              <input
                type="text"
                value={techText}
                onChange={(e) => setTechText(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="pvz. React, Node.js, Prisma"
              />
            </label>

            <label className="text-sm md:col-span-2">
              Žymos (tags), atskirtos kableliais
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="pvz. Elektromontavimas, Pramonė, Projektavimas"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-black/80 hover:bg-black text-sm"
            >
              {editingId == null
                ? "Sukurti projektą"
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
