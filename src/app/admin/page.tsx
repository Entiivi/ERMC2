"use client";

import { useEffect, useState, FormEvent } from "react"; // NEW: added FormEvent

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Project = {
  id: string;
  title: string;
  date: string;
};

type Paraiska = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  position: string;
  cvUrl?: string | null;
  message?: string | null;
  createdAt: string;
};

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [paraiskos, setParaiskos] = useState<Paraiska[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // NEW: state for project create/edit form
  const [projectForm, setProjectForm] = useState<{
    id: string | null;
    title: string;
    date: string;
  } | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const [projectFormError, setProjectFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [projRes, parRes] = await Promise.all([
          fetch(`${API}/admin/projects`),
          fetch(`${API}/admin/paraiskos`),
        ]);
        if (!projRes.ok || !parRes.ok) {
          throw new Error("Failed to load admin data");
        }
        const [projJson, parJson] = await Promise.all([
          projRes.json(),
          parRes.json(),
        ]);
        if (!cancelled) {
          setProjects(projJson);
          setParaiskos(parJson);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Nepavyko įkelti duomenų");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [paraiskaForm, setParaiskaForm] = useState<{
    id: string | null;
    name: string;
    email: string;
    phone: string;
    position: string;
    cvUrl: string;
    message: string;
  } | null>(null);

  const [savingParaiska, setSavingParaiska] = useState(false);
  const [paraiskaFormError, setParaiskaFormError] = useState<string | null>(null);

  const deleteProject = async (id: string) => {
    if (!confirm("Tikrai ištrinti projektą?")) return;
    await fetch(`${API}/admin/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const deleteParaiska = async (id: string) => {
    if (!confirm("Tikrai ištrinti paraišką?")) return;
    await fetch(`${API}/admin/paraiskos/${id}`, { method: "DELETE" });
    setParaiskos((prev) => prev.filter((p) => p.id !== id));
  };

  // NEW: start creating a new project
  const startCreateProject = () => {
    setProjectFormError(null);
    setProjectForm({
      id: null,
      title: "",
      date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd for <input type="date">
    });
  };

  // NEW: start editing an existing project
  const startEditProject = (p: Project) => {
    setProjectFormError(null);
    setProjectForm({
      id: p.id,
      title: p.title,
      // assume p.date is ISO or date string; take first 10 chars for "YYYY-MM-DD"
      date: p.date.slice(0, 10),
    });
  };

  // NEW: cancel form
  const cancelProjectForm = () => {
    setProjectForm(null);
    setProjectFormError(null);
  };

  // NEW: save project (create or update)
  const submitProjectForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectForm) return;

    if (!projectForm.title.trim()) {
      setProjectFormError("Pavadinimas yra privalomas");
      return;
    }
    if (!projectForm.date) {
      setProjectFormError("Data yra privaloma");
      return;
    }

    try {
      setSavingProject(true);
      setProjectFormError(null);

      const isEdit = Boolean(projectForm.id);
      const url = isEdit
        ? `${API}/admin/projects/${projectForm.id}`
        : `${API}/admin/projects`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectForm.title,
          date: projectForm.date,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Nepavyko išsaugoti projekto (${res.status} ${text || ""})`.trim()
        );
      }

      const saved: Project = await res.json();

      setProjects((prev) => {
        if (isEdit) {
          // replace edited project
          return prev.map((p) => (p.id === saved.id ? saved : p));
        } else {
          // prepend newly created project
          return [saved, ...prev];
        }
      });

      setProjectForm(null);
    } catch (e: any) {
      setProjectFormError(e?.message ?? "Nepavyko išsaugoti projekto");
    } finally {
      setSavingProject(false);
    }
  };
  const startCreateParaiska = () => {
    setParaiskaFormError(null);
    setParaiskaForm({
      id: null,
      name: "",
      email: "",
      phone: "",
      position: "",
      cvUrl: "",
      message: "",
    });
  };

  const startEditParaiska = (p: Paraiska) => {
    setParaiskaFormError(null);
    setParaiskaForm({
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone ?? "",
      position: p.position,
      cvUrl: p.cvUrl ?? "",
      message: p.message ?? "",
    });
  };

  const cancelParaiskaForm = () => {
    setParaiskaForm(null);
    setParaiskaFormError(null);
  };

  const submitParaiskaForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!paraiskaForm) return;

    if (!paraiskaForm.name.trim()) {
      setParaiskaFormError("Vardas yra privalomas");
      return;
    }
    if (!paraiskaForm.email.trim()) {
      setParaiskaFormError("El. paštas yra privalomas");
      return;
    }
    if (!paraiskaForm.position.trim()) {
      setParaiskaFormError("Pozicija yra privaloma");
      return;
    }

    try {
      setSavingParaiska(true);
      setParaiskaFormError(null);

      const isEdit = Boolean(paraiskaForm.id);
      const base = `${API}/admin/paraiskos`; // čia naudoju /admin/paraiskos
      const url = isEdit ? `${base}/${paraiskaForm.id}` : base;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: paraiskaForm.name,
          email: paraiskaForm.email,
          phone: paraiskaForm.phone || null,
          position: paraiskaForm.position,
          cvUrl: paraiskaForm.cvUrl || null,
          message: paraiskaForm.message || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Nepavyko išsaugoti paraiškos (${res.status} ${text || ""})`.trim()
        );
      }

      const saved: Paraiska = await res.json();

      setParaiskos((prev) => {
        if (isEdit) {
          return prev.map((p) => (p.id === saved.id ? saved : p));
        } else {
          return [saved, ...prev];
        }
      });

      setParaiskaForm(null);
    } catch (err: any) {
      setParaiskaFormError(err?.message ?? "Nepavyko išsaugoti paraiškos");
    } finally {
      setSavingParaiska(false);
    }
  };


  return (
    <main className="min-h-screen max-w-6xl mx-auto px-6 py-8 px-[2vw]">
      <h1 className="text-2xl font-bold mb-6">Admin panelė</h1>

      {loading && <p>Kraunama…</p>}
      {err && <p className="text-red-600">{err}</p>}

      {/* Projects */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Projektai</h2>

          {/* NEW: add project button */}
          <button
            onClick={startCreateProject}
            className="text-sm px-3 py-1 rounded-md border border-teal-600 text-teal-700 hover:bg-teal-50"
          >
            + Naujas projektas
          </button>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Pavadinimas</th>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{p.title}</td>
                  <td className="px-3 py-2">
                    {new Date(p.date).toLocaleDateString("lt-LT")}
                  </td>
                  <td className="px-3 py-2 text-right space-x-3">
                    {/* NEW: edit button */}
                    <button
                      onClick={() => startEditProject(p)}
                      className="text-xs text-teal-700 hover:underline"
                    >
                      Redaguoti
                    </button>

                    <button
                      onClick={() => deleteProject(p.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Ištrinti
                    </button>
                  </td>
                </tr>
              ))}
              {!projects.length && !loading && (
                <tr>
                  <td className="px-3 py-3 text-gray-500" colSpan={3}>
                    Nėra projektų.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* NEW: project create/edit form */}
        {projectForm && (
          <div className="mt-4 border rounded-xl p-4 bg-gray-50">
            <h3 className="font-semibold mb-3">
              {projectForm.id ? "Redaguoti projektą" : "Naujas projektas"}
            </h3>

            <form
              onSubmit={submitProjectForm}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">
                  Pavadinimas
                </label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) =>
                    setProjectForm((prev) =>
                      prev ? { ...prev, title: e.target.value } : prev
                    )
                  }
                  className="w-full border rounded-md px-2 py-1 text-sm"
                  placeholder="Projekto pavadinimas"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Data</label>
                <input
                  type="date"
                  value={projectForm.date}
                  onChange={(e) =>
                    setProjectForm((prev) =>
                      prev ? { ...prev, date: e.target.value } : prev
                    )
                  }
                  className="border rounded-md px-2 py-1 text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingProject}
                  className="px-3 py-1 rounded-md bg-teal-600 text-white text-sm hover:bg-teal-700 disabled:opacity-60"
                >
                  {savingProject ? "Saugoma…" : "Išsaugoti"}
                </button>
                <button
                  type="button"
                  onClick={cancelProjectForm}
                  className="px-3 py-1 rounded-md border text-sm"
                >
                  Atšaukti
                </button>
              </div>
            </form>

            {projectFormError && (
              <p className="mt-2 text-sm text-red-600">{projectFormError}</p>
            )}
          </div>
        )}
      </section>

      {/* Paraiskos */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">CV paraiškos</h2>
          <button
            onClick={startCreateParaiska}
            className="text-sm px-3 py-1 rounded-md border border-teal-600 text-teal-700 hover:bg-teal-50"
          >
            + Nauja paraiška
          </button>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Vardas</th>
                <th className="px-3 py-2 text-left">El. paštas</th>
                <th className="px-3 py-2 text-left">Pozicija</th>
                <th className="px-3 py-2 text-left">CV</th>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {paraiskos.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2">{p.email}</td>
                  <td className="px-3 py-2">{p.position}</td>
                  <td className="px-3 py-2">
                    {p.cvUrl ? (
                      <a
                        href={p.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline"
                      >
                        Atsisiųsti
                      </a>
                    ) : (
                      <span className="text-gray-400">Nėra</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {new Date(p.createdAt).toLocaleString("lt-LT")}
                  </td>
                  <td className="px-3 py-2 text-right space-x-3">
                    <button
                      onClick={() => startEditParaiska(p)}
                      className="text-xs text-teal-700 hover:underline"
                    >
                      Redaguoti
                    </button>
                    <button
                      onClick={() => deleteParaiska(p.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Ištrinti
                    </button>
                  </td>
                </tr>
              ))}
              {!paraiskos.length && !loading && (
                <tr>
                  <td className="px-3 py-3 text-gray-500" colSpan={6}>
                    Nėra paraiškų.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {paraiskaForm && (
          <div className="mt-4 border rounded-xl p-4 bg-gray-50">
            <h3 className="font-semibold mb-3">
              {paraiskaForm.id ? "Redaguoti paraišką" : "Nauja paraiška"}
            </h3>

            <form
              onSubmit={submitParaiskaForm}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <div>
                <label className="block text-xs font-medium mb-1">Vardas</label>
                <input
                  type="text"
                  value={paraiskaForm.name}
                  onChange={(e) =>
                    setParaiskaForm((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev
                    )
                  }
                  className="w-full border rounded-md px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  El. paštas
                </label>
                <input
                  type="email"
                  value={paraiskaForm.email}
                  onChange={(e) =>
                    setParaiskaForm((prev) =>
                      prev ? { ...prev, email: e.target.value } : prev
                    )
                  }
                  className="w-full border rounded-md px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Telefonas</label>
                <input
                  type="text"
                  value={paraiskaForm.phone}
                  onChange={(e) =>
                    setParaiskaForm((prev) =>
                      prev ? { ...prev, phone: e.target.value } : prev
                    )
                  }
                  className="w-full border rounded-md px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Pozicija</label>
                <input
                  type="text"
                  value={paraiskaForm.position}
                  onChange={(e) =>
                    setParaiskaForm((prev) =>
                      prev ? { ...prev, position: e.target.value } : prev
                    )
                  }
                  className="w-full border rounded-md px-2 py-1 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1">
                  CV nuoroda (URL)
                </label>
                <input
                  type="text"
                  value={paraiskaForm.cvUrl}
                  onChange={(e) =>
                    setParaiskaForm((prev) =>
                      prev ? { ...prev, cvUrl: e.target.value } : prev
                    )
                  }
                  className="w-full border rounded-md px-2 py-1 text-sm"
                  placeholder="https://..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1">Žinutė</label>
                <textarea
                  value={paraiskaForm.message}
                  onChange={(e) =>
                    setParaiskaForm((prev) =>
                      prev ? { ...prev, message: e.target.value } : prev
                    )
                  }
                  className="w-full border rounded-md px-2 py-1 text-sm min-h-[80px]"
                />
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={savingParaiska}
                  className="px-3 py-1 rounded-md bg-teal-600 text-white text-sm hover:bg-teal-700 disabled:opacity-60"
                >
                  {savingParaiska ? "Saugoma…" : "Išsaugoti"}
                </button>
                <button
                  type="button"
                  onClick={cancelParaiskaForm}
                  className="px-3 py-1 rounded-md border text-sm"
                >
                  Atšaukti
                </button>
              </div>
            </form>

            {paraiskaFormError && (
              <p className="mt-2 text-sm text-red-600">{paraiskaFormError}</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
