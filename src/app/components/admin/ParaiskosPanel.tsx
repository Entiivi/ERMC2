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
    cvFile?: File | null;
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
      const base = `${apiBase}/paraiskos`;
      const url = isEdit ? `${base}/${paraiskaForm.id}` : base;
      const method = isEdit ? "PUT" : "POST";

      // FormData vietoj JSON
      const fd = new FormData();
      fd.append("name", paraiskaForm.name);
      fd.append("email", paraiskaForm.email);
      fd.append("phone", paraiskaForm.phone || "");
      fd.append("position", paraiskaForm.position);
      fd.append("message", paraiskaForm.message || "");

      // jei vis dar nori leisti įvesti URL ranka (optional)
      // jei nenori – šitą eilutę gali išmesti
      if (paraiskaForm.cvUrl) fd.append("cvUrl", paraiskaForm.cvUrl);

      // SVARBIAUSIA: field name "cv" turi sutapti su upload.single("cv")
      if (paraiskaForm.cvFile) {
        fd.append("cv", paraiskaForm.cvFile);
      }

      const res = await fetch(url, {
        method,
        body: fd,
        // be headers Content-Type. Browser pats uždės multipart boundary.
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

  const actionBtn =
    "[all:unset] inline-flex bg-transparent border-none outline-none appearance-none px-6 py-3 !cursor-pointer select-none transition-transform duration-200 hover:scale-105 hover:text-[#14b8a6]";

  const dangerBtnSm =
    "text-xs px-3 py-1 cursor-pointer select-none transition-transform duration-200 hover:scale-105 hover:text-[#ef4444]";


  return (
    <>
      <div className="flex items-center justify-between mb-4 pl-[1.4vw]">
        <h2 className="text-xl font-semibold">Paraiškos</h2>
        <a
          onClick={startCreateParaiska}
          className={actionBtn}
        >
          + Nauja paraiška
        </a>
      </div>

      {loading && <p className="mb-2 text-sm text-slate-100/80">Kraunama…</p>}
      {err && <p className="mb-2 text-sm text-red-200">{err}</p>}

      <div className="rounded-xl overflow-hidden mb-4 pl-[1vw]">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">Vardas</th>
              <th className="px-3 py-2 text-left">El. paštas</th>
              <th className="px-3 py-2 text-left">Pozicija</th>
              <th className="px-3 py-2 text-left">CV</th>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2">Veiksmai</th>
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
                      href={`${apiBase}${p.cvUrl.trim().replace(/^\/uploads\/cv\//, "/uploadsCV/cv/")}`}
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
                <td className="flex flex-wrap gap-[1vh]">
                  <a
                    onClick={() => startEditParaiska(p)}
                    className={actionBtn}
                  >
                    Redaguoti
                  </a>
                  <a
                    onClick={() => deleteParaiska(p.id)}
                    className={dangerBtnSm}
                  >
                    Ištrinti
                  </a>
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
        <div className="pl-[1vw] mt-2 rounded-xl p-4 bg-black/10">
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
                className="w-full px-2 py-1 text-sm text-black"
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
                className="w-full px-2 py-1 text-sm text-black"
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
                className="w-full px-2 py-1 text-sm text-black"
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
                className="w-full px-2 py-1 text-sm text-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1">
                CV (PDF)
              </label>

              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setParaiskaForm((prev) =>
                    prev ? { ...prev, cvFile: file } : prev
                  );
                }}
                className="w-full text-sm text-black file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-neutral-200 file:text-black hover:file:bg-neutral-300"
              />

              {paraiskaForm.cvFile && (
                <p className="text-xs text-white/60 mt-1">
                  Pasirinkta: {paraiskaForm.cvFile.name}
                </p>
              )}
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
                className="w-full py-1 text-sm min-h-[80px] text-black"
              />
            </div>

            <div className="md:col-span-2 flex gap-[1vw]">
              <button
                type="submit"
                disabled={savingParaiska}
                className={`${actionBtn} bg-transparent border-none outline-none appearance-none ${savingParaiska ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {savingParaiska ? "Saugoma…" : "Išsaugoti"}
              </button>
              <a
                type="button"
                onClick={cancelParaiskaForm}
                className={dangerBtnSm}
              >
                Atšaukti
              </a>
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
