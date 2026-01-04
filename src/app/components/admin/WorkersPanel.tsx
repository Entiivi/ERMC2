"use client";

import { useEffect, useState, FormEvent } from "react";

export type WorkerDTO = {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
};

type WorkersPanelProps = {
  apiBase: string; // e.g. process.env.NEXT_PUBLIC_API_URL
};

export function WorkersPanel({ apiBase }: WorkersPanelProps) {
  const [workers, setWorkers] = useState<WorkerDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setRole("");
  };

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiBase}/workers`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Serverio klaida: ${res.status}`);

      const data = (await res.json()) as WorkerDTO[];
      setWorkers(data);
    } catch (err: any) {
      console.error("Nepavyko gauti darbuotojų:", err);
      setError(err?.message ?? "Nepavyko gauti darbuotojų");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Vardas ir pavardė (fullName) privaloma");
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      role: role.trim() || null,
    };

    try {
      setError(null);

      if (editingId == null) {
        // CREATE
        const res = await fetch(`${apiBase}/workers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko sukurti darbuotojo (status ${res.status})`
          );
        }
      } else {
        // UPDATE
        const res = await fetch(`${apiBase}/workers/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko atnaujinti darbuotojo (status ${res.status})`
          );
        }
      }

      resetForm();
      await fetchWorkers();
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err?.message ?? "Nepavyko išsaugoti darbuotojo");
    }
  };

  const handleEditClick = (w: WorkerDTO) => {
    setEditingId(w.id);
    setFullName(w.fullName ?? "");
    setEmail(w.email ?? "");
    setPhone(w.phone ?? "");
    setRole(w.role ?? "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai ištrinti šį darbuotoją?")) return;

    try {
      setError(null);

      const res = await fetch(`${apiBase}/workers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || `Nepavyko ištrinti darbuotojo (status ${res.status})`
        );
      }

      // if you were editing this worker, reset
      if (editingId === id) resetForm();

      await fetchWorkers();
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err?.message ?? "Nepavyko ištrinti darbuotojo");
    }
  };

  const actionBtn =
    "px-6 py-3 cursor-pointer select-none transition-transform duration-200 hover:scale-105 hover:text-[#14b8a6]";

  const dangerBtnSm =
    "text-xs px-3 py-1 cursor-pointer select-none transition-transform duration-200 hover:scale-105 hover:text-[#ef4444]";
  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Darbuotojai</h2>
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="border border-red-500 bg-red-700/60 text-white text-sm rounded-xl px-3 py-2">
          Klaida: {error}
        </div>
      )}

      {/* TABLE */}
      <div className=" rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/20">
            <tr className="text-left">
              <th className="px-3 py-2 border-b border-white/40 w-[28%]">
                Vardas, pavardė
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[24%]">El. paštas</th>
              <th className="px-3 py-2 border-b border-white/40 w-[18%]">Telefonas</th>
              <th className="px-3 py-2 border-b border-white/40 w-[18%]">Rolė</th>
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
            ) : workers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center">
                  Darbuotojų nėra. Pridėk pirmą įrašą žemiau esančioje formoje.
                </td>
              </tr>
            ) : (
              workers.map((w) => (
                <tr key={w.id} className="odd:bg-white/5 even:bg-white/0">
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="font-semibold break-words">{w.fullName}</div>
                  </td>

                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {w.email ? (
                      <span className="break-all">{w.email}</span>
                    ) : (
                      <span className="opacity-60 text-xs">-</span>
                    )}
                  </td>

                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {w.phone ? (
                      <span className="break-all">{w.phone}</span>
                    ) : (
                      <span className="opacity-60 text-xs">-</span>
                    )}
                  </td>

                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {w.role ? (
                      <span className="break-words">{w.role}</span>
                    ) : (
                      <span className="opacity-60 text-xs">-</span>
                    )}
                  </td>

                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="flex flex-wrap gap-[1vh]">
                      <a
                        type="button"
                        onClick={() => handleEditClick(w)}
                        className={actionBtn}
                      >
                        Redaguoti
                      </a>

                      <a
                        type="button"
                        onClick={() => handleDelete(w.id)}
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

      {/* FORM */}
      <section className="rounded-2xl pl-[1vw]">
        <h3 className="text-lg font-semibold mb-2">
          {editingId == null ? "Pridėti naują darbuotoją" : "Redaguoti darbuotoją"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm md:col-span-2">
              Vardas ir pavardė (fullName) *
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                required
              />
            </label>

            <label className="text-sm">
              El. paštas
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="vardas@imone.lt"
              />
            </label>

            <label className="text-sm">
              Telefonas
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="+370..."
              />
            </label>

            <label className="text-sm md:col-span-2">
              Rolė / pareigos
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="Projektų vadovas, Meistras, ..."
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-[2vw] pt-[1vh]">
            <a
              type="submit"
              className={actionBtn}
            >
              {editingId == null ? "Sukurti darbuotoją" : "Išsaugoti pakeitimus"}
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
          </div>
        </form>
      </section>
    </div>
  );
}
