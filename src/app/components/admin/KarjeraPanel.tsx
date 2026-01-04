"use client";

import { useEffect, useState, FormEvent } from "react";
import { KarjeraPreviewPanel } from "../admin/prerview/KarjeraPreviewPanel"

type Lang = "LT" | "EN";

export type Job = {
  id: string;
  lang: Lang;
  title: string;
  description?: string | null;
  location?: string | null;
  type?: string | null;
  salary?: string | null;
  postedAt: string;       // ISO string
  responsibilities: string[];
};

type CareersPanelProps = {
  apiBase: string;
};

export function CareersPanel({ apiBase }: CareersPanelProps) {
  const [lang, setLang] = useState<Lang>("LT");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [salary, setSalary] = useState("");
  const [postedAt, setPostedAt] = useState(""); // YYYY-MM-DD

  // VIETOJ textarea string – turim masyvą su atskirom eilutėm
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setLocation("");
    setType("");
    setSalary("");
    setPostedAt("");
    setResponsibilities([""]);
  };

  const fetchJobs = async (currentLang: Lang) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiBase}/darbas?lang=${currentLang}`);
      if (!res.ok) {
        throw new Error(`Serverio klaida: ${res.status}`);
      }

      const data = (await res.json()) as Job[];
      setJobs(data);
    } catch (err: any) {
      console.error("Nepavyko gauti darbo skelbimų:", err);
      setError(err?.message ?? "Nepavyko gauti darbo skelbimų");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(lang);
  }, [lang]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Pavadinimas (title) privalomas");
      return;
    }

    const respLines = responsibilities
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      type: type.trim() || null,
      salary: salary.trim() || null,
      lang,
      responsibilities: respLines,                   // <-- masyvas
      postedAt: postedAt ? new Date(postedAt).toISOString() : undefined,
    };

    try {
      setError(null);

      if (editingId == null) {
        // CREATE
        const res = await fetch(`${apiBase}/darbas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko sukurti darbo skelbimo (status ${res.status})`
          );
        }
      } else {
        // UPDATE
        const res = await fetch(`${apiBase}/darbas/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko atnaujinti darbo skelbimo (status ${res.status})`
          );
        }
      }

      resetForm();
      await fetchJobs(lang);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err?.message ?? "Nepavyko išsaugoti darbo skelbimo");
    }
  };

  const handleEditClick = (job: Job) => {
    setEditingId(job.id);
    setTitle(job.title ?? "");
    setDescription(job.description ?? "");
    setLocation(job.location ?? "");
    setType(job.type ?? "");
    setSalary(job.salary ?? "");
    setPostedAt(job.postedAt ? job.postedAt.slice(0, 10) : "");

    setResponsibilities(
      job.responsibilities && job.responsibilities.length > 0
        ? job.responsibilities
        : [""]
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai ištrinti šį darbo skelbimą?")) return;

    try {
      setError(null);
      const res = await fetch(`${apiBase}/darbas/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || `Nepavyko ištrinti darbo skelbimo (status ${res.status})`
        );
      }

      await fetchJobs(lang);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err?.message ?? "Nepavyko ištrinti darbo skelbimo");
    }
  };

  // --- RESPONSIBILITIES UI HELPERS ---

  const updateResponsibility = (index: number, value: string) => {
    setResponsibilities((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const addResponsibility = () => {
    setResponsibilities((prev) => [...prev, ""]);
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy.length === 0 ? [""] : copy;
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">
            Karjera
          </h2>
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

      {/* ERROR */}
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
              <th className="px-3 py-2 border-b border-white/40 w-[30%]">
                Pavadinimas / atsakomybės
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[15%]">
                Vieta
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[15%]">
                Tipas
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[15%]">
                Alga
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[10%]">
                Paskelbta
              </th>
              <th className="px-3 py-2 border-b border-white/40">
                Veiksmai
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center">
                  Kraunama...
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center">
                  Skelbimų nėra. Pridėk pirmą įrašą žemiau esančioje formoje.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="odd:bg-white/5 even:bg-white/0">
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="font-semibold">{job.title}</div>
                    {job.description && (
                      <div className="text-xs opacity-90 mt-1">
                        {job.description}
                      </div>
                    )}
                    {job.responsibilities.length > 0 && (
                      <ul className="mt-1 text-xs list-disc list-inside opacity-90">
                        {job.responsibilities.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {job.location || (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {job.type || (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {job.salary || (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {job.postedAt.slice(0, 10)}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(job)}
                        className="text-xs px-3 py-1 rounded-full bg-black/70 hover:bg-black"
                      >
                        Redaguoti
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(job.id)}
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
      <section className="rounded-2xl p-4">
        <h3 className="text-lg font-semibold mb-2">
          {editingId == null ? "Pridėti naują darbo skelbimą" : "Redaguoti darbo skelbimą"}
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
              Vieta
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="pvz. Vilnius / hibridinis"
              />
            </label>

            <label className="text-sm">
              Tipas
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="pvz. Pilnas etatas, praktika"
              />
            </label>

            <label className="text-sm">
              Alga
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="pvz. 1500–2000 €/mėn. prieš mokesčius"
              />
            </label>

            <label className="text-sm">
              Paskelbimo data
              <input
                type="date"
                value={postedAt}
                onChange={(e) => setPostedAt(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
              />
            </label>

            <label className="text-sm md:col-span-2">
              Aprašymas
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm h-20 resize-vertical"
              />
            </label>

            {/* RESPONSIBILITIES LIST EDITOR */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">
                  Atsakomybės (kiekvienas punktas atskirame laukelyje)
                </span>
                <button
                  type="button"
                  onClick={addResponsibility}
                  className="text-xs px-3 py-1 rounded-full bg-black/80 hover:bg-black"
                >
                  + Pridėti punktą
                </button>
              </div>

              <div className="space-y-2">
                {responsibilities.map((value, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs w-5 text-right">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        updateResponsibility(index, e.target.value)
                      }
                      className="flex-1 rounded-md border border-black px-2 py-1 text-black text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeResponsibility(index)}
                      className="text-xs px-2 py-1 rounded-full bg-red-700 hover:bg-red-800"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-black/80 hover:bg-black text-sm"
            >
              {editingId == null
                ? "Sukurti darbo skelbimą"
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
      <KarjeraPreviewPanel lang={lang} />
    </div>
    
  );
}
