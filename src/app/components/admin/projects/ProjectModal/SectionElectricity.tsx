"use client";

import { useEffect, useState } from "react";

type Provider = {
    id: string;
    name: string;
    type?: "SUPPLIER" | "DSO" | "TSO";
    isPrimary: boolean;
    note: string | null;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
};

type ElectricityData = {
    estimatedKwhPerMonth: number | null;
    electricityNotes: string | null;
    providers: Provider[];
};

type ProviderOption = {
    id: string;
    name: string;
};


export function SectionElectricity({
    apiBase,
    projektasId,
}: {
    apiBase: string;
    projektasId: string;
}) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [kwh, setKwh] = useState<number | "">("");
    const [notes, setNotes] = useState("");

    const [providers, setProviders] = useState<Provider[]>([]);
    const [supplierOptions, setSupplierOptions] = useState<ProviderOption[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<string>("");


    // -----------------------------
    // LOAD DATA
    // -----------------------------
    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                const r = await fetch(`${apiBase}/projects/${projektasId}/electricity`);
                const data = await r.json();

                if (!alive) return;

                // data = { ok:true, items:[ { isPrimary, note, provider:{ id,name,type,... } } ] }
                const mapped: Provider[] = (data?.items ?? []).map((row: any) => ({
                    id: row.provider.id,
                    name: row.provider.name,
                    type: row.provider.type,
                    isPrimary: row.isPrimary,
                    note: row.note,
                    website: row.provider.website,
                    phone: row.provider.phone,
                    email: row.provider.email,
                }));

                const eso = providers.find((p) => p.type === "DSO");
                const suppliers = providers.filter((p) => p.type === "SUPPLIER");

                console.log("electricity mapped providers:", mapped);
                setProviders(mapped);
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [apiBase, projektasId]);


    // -----------------------------
    // LOAD SUPPLIERS (SUPPLIER only)
    // -----------------------------
    useEffect(() => {
        (async () => {
            const r = await fetch(`${apiBase}/electricity/providers?supplier=true`);
            const data = await r.json();
            setSupplierOptions(data.items ?? []);
        })();
    }, [apiBase]);

    // -----------------------------
    // SAVE BASIC ELECTRICITY INFO
    // -----------------------------
    async function saveElectricity() {
        setSaving(true);
        try {
            await fetch(`${apiBase}/projects/${projektasId}/electricity`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    estimatedKwhPerMonth: kwh === "" ? null : Number(kwh),
                    electricityNotes: notes.trim() || null,
                }),
            });
        } finally {
            setSaving(false);
        }
    }

    // -----------------------------
    // ADD / UPDATE SUPPLIER
    // -----------------------------
    async function addSupplier(providerId: string) {
        await fetch(`${apiBase}/projects/${projektasId}/providers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ providerId, isPrimary: true }),
        });

        const r = await fetch(`${apiBase}/projects/${projektasId}/electricity`);
        const data = await r.json();

        const mapped: Provider[] = (data?.items ?? []).map((row: any) => ({
            id: row?.provider?.id ?? row?.providerId,
            name: row?.provider?.name ?? "—",
            isPrimary: !!row?.isPrimary,
            note: row?.note ?? null,
        }));

        setProviders(mapped);
    }

    // -----------------------------
    // REMOVE SUPPLIER
    // -----------------------------
    async function removeSupplier(providerId: string) {
        await fetch(
            `${apiBase}/projects/${projektasId}/providers/${providerId}`,
            { method: "DELETE" }
        );

        setProviders((p) => p.filter((x) => x.id !== providerId));
    }

    if (loading) {
        return <div className="text-sm text-black/60">Kraunama elektros informacija…</div>;
    }

    const eso = providers.find((p) => p.name === "ESO");
    const suppliers = providers.filter((p) => p.name !== "ESO");

    return (
        <div className="space-y-6">

            {/* ESO */}
            <div className="rounded-xl bg-black/5 p-4">
                <div className="text-sm font-semibold mb-2">
                    Skirstymo operatorius (ESO)
                </div>

                {eso ? (
                    <div className="space-y-1 text-sm text-black/80">
                        <div>
                            <span className="font-medium">Pavadinimas:</span>{" "}
                            {eso.name}
                        </div>

                        <div>
                            <span className="font-medium">Tipas:</span>{" "}
                            Skirstymo operatorius (DSO)
                        </div>

                        <div>
                            <span className="font-medium">Priskyrimas:</span>{" "}
                            automatiškai pagal projekto vietą
                        </div>

                        {eso.phone && (
                            <div>
                                <span className="font-medium">Telefonas:</span>{" "}
                                <a href={`tel:${eso.phone}`} className="underline">
                                    {eso.phone}
                                </a>
                            </div>
                        )}

                        {eso.website && (
                            <div>
                                <span className="font-medium">Svetainė:</span>{" "}
                                <a
                                    href={eso.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                >
                                    {eso.website.replace("https://", "")}
                                </a>
                            </div>
                        )}

                        {eso.note && (
                            <div className="text-xs text-black/60 mt-2">
                                Pastaba: {eso.note}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-red-600">
                        ESO nepriskirta (tai neturėtų įvykti)
                    </div>
                )}
            </div>

            {/* SUPPLIER */}
            <div>
                <div className="text-sm font-semibold mb-1">Elektros tiekėjas</div>

                {suppliers.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 text-sm">
                        <span>{s.name}</span>
                        {s.isPrimary && <span className="text-xs">(pagrindinis)</span>}
                        <button
                            className="text-xs underline"
                            onClick={() => removeSupplier(s.id)}
                        >
                            pašalinti
                        </button>
                    </div>
                ))}

                <div className="mt-2 flex gap-2">
                    <select
                        className="border rounded px-2 py-1 text-sm"
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                    >
                        <option value="">Pasirinkti tiekėją</option>
                        {supplierOptions.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name}
                            </option>
                        ))}
                    </select>

                    <button
                        className="px-3 py-1 text-sm border rounded"
                        disabled={!selectedSupplier}
                        onClick={() => {
                            addSupplier(selectedSupplier);
                            setSelectedSupplier("");
                        }}
                    >
                        Pridėti
                    </button>
                </div>
            </div>

            {/* KWH */}
            <div>
                <div className="text-sm font-semibold mb-1">Numatomas elektros suvartojimas</div>
                <input
                    type="number"
                    value={kwh}
                    onChange={(e) =>
                        setKwh(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="border rounded px-2 py-1 text-sm w-40"
                    placeholder="kWh / mėn"
                />
            </div>

            {/* NOTES */}
            <div>
                <div className="text-sm font-semibold mb-1">Pastabos</div>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="Papildoma informacija apie elektrą…"
                />
            </div>

            {/* SAVE */}
            <div>
                <button
                    onClick={saveElectricity}
                    className="px-4 py-2 text-sm border rounded"
                    disabled={saving}
                >
                    {saving ? "Saugoma…" : "Išsaugoti"}
                </button>
            </div>
        </div>
    );
}
