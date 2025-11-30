"use client";

import { useEffect, useState, FormEvent } from "react";

type Lang = "LT" | "EN";

export type Partner = {
  id: string;
  name: string;
  image: string | null;      // base64 iš backend
  imageSrc: string | null;   // failo kelias
  alt: string | null;
  lang: Lang;
};

type PartnersPanelProps = {
  apiBase: string;
};

export function PartnersPanel({ apiBase }: PartnersPanelProps) {
  const [lang, setLang] = useState<Lang>("LT");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [alt, setAlt] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setImageSrc("");
    setAlt("");
  };

  const fetchPartners = async (currentLang: Lang) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiBase}/partneriai?lang=${currentLang}`);
      if (!res.ok) {
        throw new Error(`Serverio klaida: ${res.status}`);
      }

      const data = (await res.json()) as Partner[];
      setPartners(data);
    } catch (err: any) {
      console.error("Nepavyko gauti partnerių:", err);
      setError(err?.message ?? "Nepavyko gauti partnerių");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners(lang);
  }, [lang]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Pavadinimas (name) privalomas");
      return;
    }

    const payload = {
      name: name.trim(),
      imageSrc: imageSrc.trim() || null,
      imageAlt: alt.trim() || null,
      lang,
    };

    try {
      setError(null);

      if (editingId == null) {
        // CREATE
        const res = await fetch(`${apiBase}/partneriai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko sukurti partnerio (status ${res.status})`
          );
        }
      } else {
        // UPDATE
        const res = await fetch(`${apiBase}/partneriai/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko atnaujinti partnerio (status ${res.status})`
          );
        }
      }

      resetForm();
      await fetchPartners(lang);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err?.message ?? "Nepavyko išsaugoti partnerio");
    }
  };

  const handleEditClick = (partner: Partner) => {
    setEditingId(partner.id);
    setName(partner.name ?? "");
    setImageSrc(partner.imageSrc ?? "");
    setAlt(partner.alt ?? "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai ištrinti šį partnerį?")) return;

    try {
      setError(null);
      const res = await fetch(`${apiBase}/partneriai/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || `Nepavyko ištrinti partnerio (status ${res.status})`
        );
      }

      await fetchPartners(lang);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err?.message ?? "Nepavyko ištrinti partnerio");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">
            Partnerių administravimas
          </h2>
          <p className="text-sm opacity-90">
            Čia gali pridėti, redaguoti ir trinti partnerių logotipus ir pavadinimus.
          </p>
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
            className="text-black text-sm rounded-md px-2 py-1 border border-black"
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
      <div className="border border-white/70 rounded-2xl overflow-hidden bg-[#22c55e]/40">
        <table className="w-full text-sm">
          <thead className="bg-black/20">
            <tr className="text-left">
              <th className="px-3 py-2 border-b border-white/40 w-[20%]">
                Logotipas
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[25%]">
                Pavadinimas
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[25%]">
                Alt tekstas
              </th>
              <th className="px-3 py-2 border-b border-white/40">
                Image kelias
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
            ) : partners.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center">
                  Partnerių nėra. Pridėk pirmą įrašą žemiau esančioje formoje.
                </td>
              </tr>
            ) : (
              partners.map((p) => (
                <tr key={p.id} className="odd:bg-white/5 even:bg-white/0">
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.alt ?? p.name}
                        className="max-h-12 max-w-[120px] object-contain bg-white rounded-md px-1 py-1"
                      />
                    ) : (
                      <span className="opacity-60 text-xs">Nėra logotipo</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="font-semibold">{p.name}</div>
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {p.alt || (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {p.imageSrc ? (
                      <span className="break-all text-xs">{p.imageSrc}</span>
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

      {/* FORMA: Add / Edit */}
      <section className="border border-white/60 rounded-2xl p-4 bg-[#22c55e]/60">
        <h3 className="text-lg font-semibold mb-2">
          {editingId == null ? "Pridėti naują partnerį" : "Redaguoti partnerį"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm">
              Pavadinimas *
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                required
              />
            </label>

            <label className="text-sm">
              Alt tekstas (aprašas)
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="pvz. ERMC logotipas"
              />
            </label>

            <label className="text-sm md:col-span-2">
              Logotipo failo kelias (imageSrc)
              <input
                type="text"
                value={imageSrc}
                onChange={(e) => setImageSrc(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="pvz. ermc_logo.png arba uploads/homepage-photos/..."
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-black/80 hover:bg-black text-sm"
            >
              {editingId == null ? "Sukurti partnerį" : "Išsaugoti pakeitimus"}
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
