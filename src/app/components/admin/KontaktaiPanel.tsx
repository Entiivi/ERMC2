"use client";

import { useEffect, useState, FormEvent } from "react";
import { FooterPreviewPanel } from "../admin/prerview/FooterPreviewPanel"
import { IconPicker } from "@/app/components/admin/IconPicker";

type Lang = "LT" | "EN";

export type KontaktasDTO = {
  id: string;
  lang: Lang;
  label: string;
  value: string;
  icon?: string | null;
  copyable?: boolean | null;
  order?: number | null;
};

type ContactsPanelProps = {
  apiBase: string;
};

const CopyText: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Nepavyko nukopijuoti:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-xs px-3 py-1 rounded-full border border-slate-400/70 bg-white/90 text-slate-800 hover:bg-teal-500 hover:text-white hover:border-teal-600 transition-colors"
      title="Kopijuoti"
    >
      {copied ? "Nukopijuota" : "Kopijuoti"}
    </button>
  );
};

export function ContactsPanel({ apiBase }: ContactsPanelProps) {
  const [lang, setLang] = useState<Lang>("LT");
  const [contacts, setContacts] = useState<KontaktasDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [icon, setIcon] = useState("");
  const [copyable, setCopyable] = useState(true);
  const [order, setOrder] = useState<number | "">("");

  const resetForm = () => {
    setEditingId(null);
    setLabel("");
    setValue("");
    setIcon("");
    setCopyable(true);
    setOrder("");
  };

  const fetchContacts = async (currentLang: Lang) => {
    try {
      setLoading(true);
      setError(null);

      // jei backend route /kontaktai – palik taip,
      // jei kitoks, čia pakeisk
      const res = await fetch(`${apiBase}/kontaktai`);
      if (!res.ok) {
        throw new Error(`Serverio klaida: ${res.status}`);
      }

      const data = (await res.json()) as KontaktasDTO[];
      setContacts(data.filter((c) => c.lang === currentLang));
    } catch (err: any) {
      console.error("Nepavyko gauti kontaktų:", err);
      setError(err?.message ?? "Nepavyko gauti kontaktų");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(lang);
  }, [lang]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!label.trim()) {
      alert("Žyma (label) privaloma");
      return;
    }
    if (!value.trim()) {
      alert("Reikšmė (value) privaloma");
      return;
    }

    const payload = {
      label: label.trim(),
      value: value.trim(),
      icon: icon.trim() || null,
      copyable,
      lang,
      order: order === "" ? undefined : Number(order),
    };

    try {
      setError(null);

      if (editingId == null) {
        // CREATE
        const res = await fetch(`${apiBase}/kontaktai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko sukurti kontakto (status ${res.status})`
          );
        }
      } else {
        // UPDATE
        const res = await fetch(`${apiBase}/kontaktai/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko atnaujinti kontakto (status ${res.status})`
          );
        }
      }

      resetForm();
      await fetchContacts(lang);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err?.message ?? "Nepavyko išsaugoti kontakto");
    }
  };

  const handleEditClick = (c: KontaktasDTO) => {
    setEditingId(c.id);
    setLabel(c.label ?? "");
    setValue(c.value ?? "");
    setIcon(c.icon ?? "");
    setCopyable(!!c.copyable);
    setOrder(
      typeof c.order === "number" && !Number.isNaN(c.order) ? c.order : ""
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai ištrinti šį kontaktą?")) return;

    try {
      setError(null);
      const res = await fetch(`${apiBase}/kontaktai/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || `Nepavyko ištrinti kontakto (status ${res.status})`
        );
      }

      await fetchContacts(lang);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err?.message ?? "Nepavyko ištrinti kontakto");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">
            Kontaktai
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
              <th className="px-3 py-2 border-b border-white/40 w-[20%]">
                Žyma
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[40%]">
                Reikšmė
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[15%]">
                Ikona
              </th>
              <th className="px-3 py-2 border-b border-white/40 w-[10%]">
                Eilė
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
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center">
                  Kontaktų nėra. Pridėk pirmą įrašą žemiau esančioje formoje.
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.id} className="odd:bg-white/5 even:bg-white/0">
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="font-semibold">{c.label}</div>
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="flex items-center gap-2">
                      <span className="break-all">{c.value}</span>
                      {c.copyable && <CopyText text={c.value} />}
                    </div>
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {c.icon ? (
                      <span className="text-xs break-all">{c.icon}</span>
                    ) : (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    {typeof c.order === "number" ? c.order : (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-white/20 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(c)}
                        className="text-xs px-3 py-1 rounded-full bg-black/70 hover:bg-black"
                      >
                        Redaguoti
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
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
          {editingId == null ? "Pridėti naują kontaktą" : "Redaguoti kontaktą"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm">
              Žyma (pvz. Įmonės kodas) *
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
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
                  setOrder(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="0"
              />
            </label>

            <label className="text-sm md:col-span-2">
              Reikšmė (pvz. +370 616 44551, adresas, el. paštas) *
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                required
              />
            </label>

            <IconPicker
              apiBase={apiBase}
              value={icon}
              onChange={setIcon}
            />

            <label className="text-sm flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={copyable}
                onChange={(e) => setCopyable(e.target.checked)}
                className="h-4 w-4 text-black"
              />
              <span>Leisti nukopijuoti reikšmę (rodys „Kopijuoti“ mygtuką)</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-black/80 hover:bg-black text-sm"
            >
              {editingId == null
                ? "Sukurti kontaktą"
                : "Išsaugoti pakeitimus"}
            </button>

            {editingId != null && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-1.5 rounded-full bg.white/80 hover:bg-white text-sm text-black"
              >
                Atšaukti redagavimą
              </button>
            )}
          </div>
        </form>
      </section>
      <FooterPreviewPanel lang={lang} />
    </div>
  );
}
