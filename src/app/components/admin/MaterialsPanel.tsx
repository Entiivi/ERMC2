"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";

export type MaterialDTO = {
  key: string;
  name: string;
  unit: string;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  sku?: string | null;
  isActive?: boolean | null;

  // returned only when includeCurrentPrice=true
  currentPrice?: {
    id: string;
    supplier?: string | null;
    price: string; // Decimal serialized as string
    currency: string;
    vatRate?: string | null;
    validFrom: string;
    validTo?: string | null;
  } | null;
};

type MaterialsPanelProps = {
  apiBase: string;
};

function normalizeKey(input: string) {
  // "Cement CEM II 42.5R" -> "cement_cem_ii_42_5r"
  return input
    .trim()
    .toLowerCase()
    .replace(/ą/g, "a")
    .replace(/č/g, "c")
    .replace(/ę/g, "e")
    .replace(/ė/g, "e")
    .replace(/į/g, "i")
    .replace(/š/g, "s")
    .replace(/ų/g, "u")
    .replace(/ū/g, "u")
    .replace(/ž/g, "z")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function MaterialsPanel({ apiBase }: MaterialsPanelProps) {
  const [materials, setMaterials] = useState<MaterialDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // simple filtering
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  // form state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [key, setKey] = useState("");
  const [autoKey, setAutoKey] = useState(true);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("vnt");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [isActive, setIsActive] = useState(true);

  // price form (current price)
  const [price, setPrice] = useState(""); // string number
  const [currency, setCurrency] = useState("EUR");
  const [vatRate, setVatRate] = useState(""); // optional, e.g. "21"
  const [supplier, setSupplier] = useState("");

  const resetForm = () => {
    setEditingKey(null);
    setKey("");
    setAutoKey(true);
    setName("");
    setUnit("vnt");
    setDescription("");
    setCategory("");
    setBrand("");
    setSku("");
    setIsActive(true);

    setPrice("");
    setCurrency("EUR");
    setVatRate("");
    setSupplier("");
  };

  // auto key generation
  useEffect(() => {
    if (!autoKey) return;
    if (editingKey != null) return; // don't overwrite key while editing
    const k = normalizeKey(name);
    setKey(k);
  }, [name, autoKey, editingKey]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);

      const qs = new URLSearchParams();
      qs.set("includeCurrentPrice", "true");
      if (activeOnly) qs.set("activeOnly", "true");

      const res = await fetch(`${apiBase}/materials?${qs.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Serverio klaida: ${res.status}`);

      const data = (await res.json()) as MaterialDTO[];
      setMaterials(data);
    } catch (err: any) {
      console.error("Nepavyko gauti medžiagų:", err);
      setError(err?.message ?? "Nepavyko gauti medžiagų");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOnly]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return materials;

    return materials.filter((m) => {
      const hay = [
        m.key,
        m.name,
        m.unit,
        m.category ?? "",
        m.brand ?? "",
        m.sku ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [materials, search]);

  const handleCreateOrUpdate = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return alert("Pavadinimas (name) privalomas");
    if (!unit.trim()) return alert("Vienetas (unit) privalomas");

    // key required only on create
    if (editingKey == null && !key.trim()) return alert("Raktas (key) privalomas");

    const payload = {
      key: key.trim() || undefined,
      name: name.trim(),
      unit: unit.trim(),
      description: description.trim() || null,
      category: category.trim() || null,
      brand: brand.trim() || null,
      sku: sku.trim() || null,
      isActive,
    };

    try {
      setError(null);

      if (editingKey == null) {
        const res = await fetch(`${apiBase}/materials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Nepavyko sukurti medžiagos (status ${res.status})`);
        }
      } else {
        const res = await fetch(`${apiBase}/materials/${editingKey}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Nepavyko atnaujinti medžiagos (status ${res.status})`);
        }
      }

      resetForm();
      await fetchMaterials();
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err?.message ?? "Nepavyko išsaugoti medžiagos");
    }
  };

  const handleEditClick = (m: MaterialDTO) => {
    setEditingKey(m.key);
    setAutoKey(false);

    setKey(m.key);
    setName(m.name ?? "");
    setUnit(m.unit ?? "vnt");
    setDescription(m.description ?? "");
    setCategory(m.category ?? "");
    setBrand(m.brand ?? "");
    setSku(m.sku ?? "");
    setIsActive(m.isActive ?? true);

    // show current price in form (if exists)
    setPrice(m.currentPrice?.price ?? "");
    setCurrency(m.currentPrice?.currency ?? "EUR");
    setVatRate(m.currentPrice?.vatRate ?? "");
    setSupplier(m.currentPrice?.supplier ?? "");
  };

  const handleDelete = async (materialKey: string) => {
    if (!confirm("Ar tikrai ištrinti šią medžiagą?")) return;

    try {
      setError(null);

      const res = await fetch(`${apiBase}/materials/${materialKey}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Nepavyko ištrinti (status ${res.status})`);
      }

      if (editingKey === materialKey) resetForm();
      await fetchMaterials();
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err?.message ?? "Nepavyko ištrinti medžiagos");
    }
  };

  // OPTIONAL: create a new current price record (requires a price route)
  const handleSavePrice = async () => {
    if (editingKey == null) {
      alert("Pirma sukurk medžiagą, tada nustatyk kainą.");
      return;
    }
    if (!price.trim()) {
      alert("Kaina (price) privaloma");
      return;
    }

    // This endpoint is not created yet. We'll create it next:
    // POST /materials/:key/prices  -> creates a new current price and closes previous.
    const payload = {
      price: price.trim(),
      currency: currency.trim() || "EUR",
      vatRate: vatRate.trim() || null,
      supplier: supplier.trim() || null,
    };

    try {
      setError(null);
      const res = await fetch(`${apiBase}/materials/${editingKey}/prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Nepavyko išsaugoti kainos (status ${res.status})`);
      }

      await fetchMaterials();
    } catch (err: any) {
      console.error("Price save error:", err);
      setError(err?.message ?? "Nepavyko išsaugoti kainos");
    }
  };

  const actionBtn =
    "px-6 py-3 cursor-pointer select-none transition-transform duration-200 hover:scale-105 hover:text-[#14b8a6]";

  const dangerBtnSm =
    "text-xs px-3 py-1 cursor-pointer select-none transition-transform duration-200 hover:scale-105 hover:text-[#ef4444]";
  return (
    <div className="space-y-6 pl-[1vw] overflow-x-hidden">
      {/* HEADER */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Medžiagos</h2>
          <p className="text-sm opacity-90">
            Katalogas medžiagoms (vienetai, kategorijos, aktyvumas). Jei įjungtas kainų endpointas,
            čia gali nustatyti ir aktualią kainą.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Rodyti tik aktyvias</span>
          </label>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Paieška: cementas, sku, kategorija..."
            className="w-72 max-w-full rounded-md px-2 py-1 text-black text-sm"
          />
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="border border-red-500 bg-red-700/60 text-white text-sm rounded-xl px-3 py-2">
          Klaida: {error}
        </div>
      )}

      {/* TABLE */}
      <div className="rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/20">
            <tr className="text-left">
              <th className="px-3 py-2 border-b border-white/40 w-[18%]">Key</th>
              <th className="px-3 py-2 border-b border-white/40 w-[22%]">Pavadinimas</th>
              <th className="px-3 py-2 border-b border-white/40 w-[8%]">Vnt</th>
              <th className="px-3 py-2 border-b border-white/40 w-[14%]">Kategorija</th>
              <th className="px-3 py-2 border-b border-white/40 w-[12%]">Kaina</th>
              <th className="px-3 py-2 border-b border-white/40 w-[10%]">Aktyvi</th>
              <th className="px-3 py-2 border-b border-white/40">Veiksmai</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center">
                  Kraunama...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center">
                  Medžiagų nėra. Pridėk pirmą įrašą žemiau esančioje formoje.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.key} className="odd:bg-white/5 even:bg-white/0">
                  <td className="px-3 py-2 align-top">
                    <div className="font-mono text-xs break-all">{m.key}</div>
                    {m.sku ? <div className="text-xs opacity-80 break-all">SKU: {m.sku}</div> : null}
                  </td>

                  <td className="px-3 py-2 align-top">
                    <div className="font-semibold break-words">{m.name}</div>
                    {m.brand ? <div className="text-xs opacity-80">{m.brand}</div> : null}
                  </td>

                  <td className="px-3 py-2 align-top">{m.unit}</td>

                  <td className="px-3 py-2 align-top">
                    {m.category ? m.category : <span className="opacity-60 text-xs">–</span>}
                  </td>

                  <td className="px-3 py-2 align-top">
                    {m.currentPrice?.price ? (
                      <div className="text-xs">
                        <div className="font-semibold">
                          {m.currentPrice.price} {m.currentPrice.currency}
                        </div>
                        {m.currentPrice.vatRate ? (
                          <div className="opacity-80">PVM: {m.currentPrice.vatRate}%</div>
                        ) : null}
                      </div>
                    ) : (
                      <span className="opacity-60 text-xs">–</span>
                    )}
                  </td>

                  <td className="px-3 py-2 align-top">
                    {m.isActive ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-black/50">Taip</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-700/70">
                        Ne
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2 align-top">
                    <div className="flex flex-wrap gap-[1vw]">
                      <a
                        type="button"
                        onClick={() => handleEditClick(m)}
                        className={actionBtn}
                      >
                        Redaguoti
                      </a>
                      <a
                        type="button"
                        onClick={() => handleDelete(m.key)}
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
      <section className="rounded-2xl p-4">
        <h3 className="text-lg font-semibold mb-2">
          {editingKey == null ? "Pridėti naują medžiagą" : `Redaguoti medžiagą: ${editingKey}`}
        </h3>

        <form onSubmit={handleCreateOrUpdate} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* KEY */}
            <label className="text-sm">
              Raktas (key) {editingKey == null ? "*" : "(nekoreguojamas)"}{" "}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full rounded-md border border-black px-2 py-1 text-black text-sm font-mono"
                  required={editingKey == null}
                  disabled={editingKey != null}
                />
              </div>
              {editingKey == null && (
                <label className="mt-2 flex items-center gap-2 text-xs opacity-90">
                  <input
                    type="checkbox"
                    checked={autoKey}
                    onChange={(e) => setAutoKey(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Generuoti key automatiškai iš pavadinimo</span>
                </label>
              )}
            </label>

            {/* UNIT */}
            <label className="text-sm">
              Vienetas (unit) *
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                required
              >
                <option value="vnt">vnt</option>
                <option value="kg">kg</option>
                <option value="t">t</option>
                <option value="m">m</option>
                <option value="m2">m²</option>
                <option value="m3">m³</option>
                <option value="l">l</option>
                <option value="pak">pak</option>
              </select>
            </label>

            {/* NAME */}
            <label className="text-sm md:col-span-2">
              Pavadinimas (name) *
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                required
              />
            </label>

            {/* CATEGORY */}
            <label className="text-sm">
              Kategorija
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="CEMENT, STEEL, CABLES..."
              />
            </label>

            {/* BRAND */}
            <label className="text-sm">
              Prekės ženklas (brand)
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="Knauf, Weber..."
              />
            </label>

            {/* SKU */}
            <label className="text-sm">
              SKU
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                placeholder="Tiekėjo kodas"
              />
            </label>

            {/* ACTIVE */}
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4"
              />
              <span>Aktyvi medžiaga</span>
            </label>

            {/* DESCRIPTION */}
            <label className="text-sm md:col-span-2">
              Aprašymas
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm min-h-[70px]"
                placeholder="Papildoma informacija..."
              />
            </label>

            {/* PRICE BLOCK (optional route) */}
            <div className="md:col-span-2 rounded-xl p-3 bg-black/10">

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <label className="text-sm">
                  Kaina
                  <input
                    type="text"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                    placeholder="pvz. 12.50"
                  />
                </label>

                <label className="text-sm">
                  Valiuta
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </label>

                <label className="text-sm">
                  PVM %
                  <input
                    type="text"
                    inputMode="decimal"
                    value={vatRate}
                    onChange={(e) => setVatRate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                    placeholder="21"
                  />
                </label>

                <label className="text-sm">
                  Tiekėjas
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="mt-1 w-full rounded-md border border-black px-2 py-1 text-black text-sm"
                    placeholder="pvz. Senukai"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[3vw] mt-[1vh] pl-[1vw]">

            <a
              type="submit"
              className={actionBtn}
              onClick={handleCreateOrUpdate}
            >
              {editingKey == null ? "Sukurti medžiagą" : "Išsaugoti pakeitimus"}
            </a>

            <div className="flex flex-wrap gap-2 mt-3">
              <a
                type="button"
                onClick={handleSavePrice}
                className={actionBtn}
              >
                Išsaugoti kainą
              </a>
            </div>


            {editingKey != null && (
              <a
                type="button"
                onClick={resetForm}
                className={actionBtn}
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
