"use client";

import { useEffect, useMemo, useState } from "react";

type Worker = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string | null;
};

type Assignment = {
  projektasId: string;
  workerId: string;
  position: string | null;
  startDate: string | null; // ISO
  endDate: string | null;   // ISO
  worker: Worker;
};

function toInputDate(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  // yyyy-mm-dd
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fromInputDate(value: string) {
  // siųsim kaip ISO (DateTime)
  if (!value) return null;
  const d = new Date(value + "T00:00:00.000Z");
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function SectionWorkers({
  apiBase,
  projektasId,
}: {
  apiBase: string;
  projektasId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);
  const [assigned, setAssigned] = useState<Assignment[]>([]);

  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [position, setPosition] = useState("");
  const [startDate, setStartDate] = useState(""); // yyyy-mm-dd
  const [endDate, setEndDate] = useState("");     // yyyy-mm-dd

  const [error, setError] = useState<string | null>(null);

  const assignedIds = useMemo(() => new Set(assigned.map((a) => a.workerId)), [assigned]);

  async function loadAll() {
    setError(null);
    setLoading(true);
    try {
      const [wRes, aRes] = await Promise.all([
        fetch(`${apiBase}/workers`).then((r) => r.json()),
        fetch(`${apiBase}/projects/${projektasId}/workers`).then((r) => r.json()),
      ]);

      setAllWorkers(Array.isArray(wRes) ? wRes : []);
      setAssigned(aRes?.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Nepavyko užkrauti darbuotojų");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, projektasId]);

  async function assignWorker() {
    if (!selectedWorkerId) return;

    setSaving(true);
    setError(null);
    try {
      const body = {
        workerId: selectedWorkerId,
        position: position.trim() || null,
        startDate: fromInputDate(startDate),
        endDate: fromInputDate(endDate),
      };

      const r = await fetch(`${apiBase}/projects/${projektasId}/workers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((x) => x.json());

      if (r?.ok === false) throw new Error(r?.error ?? "Nepavyko priskirti darbuotojo");

      // reload (nes include worker info patogiausia gauti per GET)
      await loadAll();

      // reset form
      setSelectedWorkerId("");
      setPosition("");
      setStartDate("");
      setEndDate("");
    } catch (e: any) {
      setError(e?.message ?? "Nepavyko priskirti darbuotojo");
    } finally {
      setSaving(false);
    }
  }

  async function removeWorker(workerId: string) {
    setSaving(true);
    setError(null);
    try {
      const r = await fetch(`${apiBase}/projects/${projektasId}/workers/${workerId}`, {
        method: "DELETE",
      }).then((x) => x.json());

      if (r?.ok === false) throw new Error(r?.error ?? "Nepavyko pašalinti darbuotojo");

      setAssigned((prev) => prev.filter((a) => a.workerId !== workerId));
    } catch (e: any) {
      setError(e?.message ?? "Nepavyko pašalinti darbuotojo");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-black/60">Kraunama darbuotojų informacija…</div>;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : null}

      {/* Assigned list */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-black mb-2">Priskirti darbuotojai</div>

        {assigned.length ? (
          <div className="space-y-2">
            {assigned.map((a) => (
              <div
                key={a.workerId}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl bg-black/[0.03] px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-sm text-black font-medium truncate">
                    {a.worker.fullName}
                  </div>
                  <div className="text-xs text-black/70">
                    {a.position ? `Pozicija projekte: ${a.position}` : a.worker.role ? `Rolė: ${a.worker.role}` : "–"}
                  </div>
                  <div className="text-xs text-black/60">
                    {a.startDate || a.endDate ? (
                      <>
                        {a.startDate ? `Nuo: ${toInputDate(a.startDate)}` : "Nuo: –"}{" "}
                        {a.endDate ? `Iki: ${toInputDate(a.endDate)}` : "Iki: –"}
                      </>
                    ) : (
                      "Laikotarpis: –"
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="shrink-0 rounded-lg px-3 py-1.5 text-xs bg-white shadow-sm"
                  onClick={() => removeWorker(a.workerId)}
                  disabled={saving}
                >
                  Pašalinti
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-black/60">Dar nėra priskirtų darbuotojų.</div>
        )}
      </div>

      {/* Assign form */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-black mb-2">Priskirti darbuotoją</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm">
            Darbuotojas
            <select
              className="mt-1 w-full rounded-lg bg-black/[0.03] px-2 py-2 text-sm"
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
            >
              <option value="">Pasirinkti…</option>
              {allWorkers.map((w) => (
                <option key={w.id} value={w.id} disabled={assignedIds.has(w.id)}>
                  {w.fullName}{w.role ? ` (${w.role})` : ""}{assignedIds.has(w.id) ? " — jau priskirtas" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            Nuo
            <input
              type="date"
              className="mt-1 w-full rounded-lg bg-black/[0.03] px-2 py-2 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>

          <label className="text-sm">
            Iki
            <input
              type="date"
              className="mt-1 w-full rounded-lg bg-black/[0.03] px-2 py-2 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm bg-black text-white disabled:opacity-50"
            onClick={assignWorker}
            disabled={saving || !selectedWorkerId}
          >
            {saving ? "Saugoma…" : "Priskirti"}
          </button>

          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm bg-black/[0.06] disabled:opacity-50"
            onClick={loadAll}
            disabled={saving}
          >
            Perkrauti
          </button>
        </div>
      </div>
    </div>
  );
}
