import { useEffect, useState, FormEvent } from "react";

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

type Props = {
  apiBase: string;
};

export function ParaiskosPanel({ apiBase }: Props) {
  const [paraiskos, setParaiskos] = useState<Paraiska[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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
  const [paraiskaFormError, setParaiskaFormError] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/admin/paraiskos`);
        if (!res.ok) throw new Error("Nepavyko įkelti paraiškų");
        const json = await res.json();
        if (!cancelled) setParaiskos(json);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Nepavyko įkelti paraiškų");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const deleteParaiska = async (id: string) => {
    if (!confirm("Tikrai ištrinti paraišką?")) return;
    await fetch(`${apiBase}/admin/paraiskos/${id}`, { method: "DELETE" });
    setParaiskos((prev) => prev.filter((p) => p.id !== id));
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
      const base = `${apiBase}/admin/paraiskos`;
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
        }
        return [saved, ...prev];
      });

      setParaiskaForm(null);
    } catch (err: any) {
      setParaiskaFormError(err?.message ?? "Nepavyko išsaugoti paraiškos");
    } finally {
      setSavingParaiska(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Paraiškos</h2>
        <button
          onClick={startCreateParaiska}
          className="text-sm px-3 py-1 rounded-md border border-teal-600 text-teal-700 hover:bg-teal-50"
        >
          + Nauja paraiška
        </button>
      </div>

      {loading && <p className="mb-2 text-sm text-slate-100/80">Kraunama…</p>}
      {err && <p className="mb-2 text-sm text-red-200">{err}</p>}

      {/* table wrapper - no background, let green bubble show */}
      <div className="rounded-xl overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">Vardas</th>
              <th className="px-3 py-2 text-left">El. paštas</th>
              <th className="px-3 py-2 text-left">Pozicija</th>
              <th className="px-3 py-2 text-left">CV</th>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {paraiskos.map((p) => (
              <tr key={p.id} className="border-t border-white/40">
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.email}</td>
                <td className="px-3 py-2">{p.position}</td>
                <td className="px-3 py-2">
                  {p.cvUrl ? (
                    <a
                      href={p.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-200 hover:underline"
                    >
                      Atsisiųsti
                    </a>
                  ) : (
                    <span className="text-white/60">Nėra</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {new Date(p.createdAt).toLocaleString("lt-LT")}
                </td>
                <td className="px-3 py-2 text-right space-x-3">
                  <button
                    onClick={() => startEditParaiska(p)}
                    className="text-xs text-teal-100 hover:underline"
                  >
                    Redaguoti
                  </button>
                  <button
                    onClick={() => deleteParaiska(p.id)}
                    className="text-xs text-red-200 hover:underline"
                  >
                    Ištrinti
                  </button>
                </td>
              </tr>
            ))}
            {!paraiskos.length && !loading && (
              <tr>
                <td className="px-3 py-3 text-sm text-white/80" colSpan={6}>
                  Nėra paraiškų.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paraiskaForm && (
        <div className="mt-2 rounded-xl p-4 border border-white/40 bg-black/10">
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
                className="w-full border rounded-md px-2 py-1 text-sm text-black"
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
                className="w-full border rounded-md px-2 py-1 text-sm text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Telefonas
              </label>
              <input
                type="text"
                value={paraiskaForm.phone}
                onChange={(e) =>
                  setParaiskaForm((prev) =>
                    prev ? { ...prev, phone: e.target.value } : prev
                  )
                }
                className="w-full border rounded-md px-2 py-1 text-sm text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Pozicija
              </label>
              <input
                type="text"
                value={paraiskaForm.position}
                onChange={(e) =>
                  setParaiskaForm((prev) =>
                    prev ? { ...prev, position: e.target.value } : prev
                  )
                }
                className="w-full border rounded-md px-2 py-1 text-sm text-black"
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
                className="w-full border rounded-md px-2 py-1 text-sm text-black"
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
                className="w-full border rounded-md px-2 py-1 text-sm min-h-[80px] text-black"
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
            <p className="mt-2 text-sm text-red-200">{paraiskaFormError}</p>
          )}
        </div>
      )}
    </>
  );
}
