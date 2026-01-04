"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type MaterialItem = {
  key: string;
  name: string;
  unit: string;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  sku?: string | null;
  isActive: boolean;

  // jei kvieti /materials?includeCurrentPrice=true
  currentPrice?: {
    id: string;
    supplier: string | null;
    price: string; // Prisma Decimal -> string
    currency: string;
    vatRate: string | null;
    validFrom: string;
    validTo: string | null;
  } | null;
};

type AssignedRow = {
  projektasId: string;
  materialKey: string;
  quantity: number;
};

type UiItem = {
  id: string; // "U:key" or "A:key"
  title: string;
  subtitle: string;
};

function SortableCard({
  id,
  title,
  subtitle,
  right,
}: {
  id: string;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
        rounded-xl
        border border-white/10
        bg-white/5
        p-3
        flex items-start justify-between gap-3
        cursor-grab
        select-none
        active:cursor-grabbing
      "
      {...attributes}
      {...listeners}
    >
      <div className="min-w-0">
        <div className="font-medium text-white truncate">{title}</div>
        <div className="text-xs text-white/60 mt-0.5 truncate">{subtitle}</div>
      </div>
      {right}
    </div>
  );
}

function Column({
  title,
  ids,
  itemsById,
  renderRight,
  droppableId,
}: {
  title: string;
  ids: string[];
  itemsById: Record<string, UiItem>;
  renderRight?: (id: string) => React.ReactNode;
  droppableId: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  return (
    <div className="flex-1 min-w-[320px]">
      <div className="text-sm text-white/80 mb-2">{title}</div>

      <div
        ref={setNodeRef}
        className={[
          "space-y-2 rounded-xl border border-white/10 p-2 min-h-[77vh]",
          isOver ? "bg-white/5" : "bg-transparent",
        ].join(" ")}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {ids.map((id) => (
            <SortableCard
              key={id}
              id={id}
              title={itemsById[id]?.title ?? id}
              subtitle={itemsById[id]?.subtitle ?? ""}
              right={renderRight?.(id)}
            />
          ))}
        </SortableContext>

        {ids.length === 0 ? <div className="text-xs text-white/50 p-2">Numesk čia</div> : null}
      </div>
    </div>
  );
}

function parseId(id: string) {
  const [side, key] = id.split(":");
  return { side, key };
}

function clampQty(v: number) {
  if (!Number.isFinite(v)) return 1;
  return Math.max(0.01, v);
}

export function MaterialsDndPicker({
  apiBase,
  projektasId,
}: {
  apiBase: string;
  projektasId: string;
}) {
  const [open, setOpen] = useState(false);

  const [catalog, setCatalog] = useState<MaterialItem[]>([]);
  const [assigned, setAssigned] = useState<AssignedRow[]>([]);
  const [saving, setSaving] = useState(false);

  const [activeId, setActiveId] = useState<string | null>(null);

  // search/filter
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("ALL");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 1, tolerance: 1 },
    })
  );

  useEffect(() => {
    (async () => {
      try {
        // 1) Catalog iš DB (tavo /materials routeris)
        const catalogRes = await fetch(
          `${apiBase}/materials?includeCurrentPrice=true&activeOnly=true`
        );
        const catalogText = await catalogRes.text();
        if (!catalogRes.ok) {
          console.error("MATERIALS HTTP", catalogRes.status, catalogText);
          throw new Error(`Materials HTTP ${catalogRes.status}`);
        }

        const catalogJson = JSON.parse(catalogText);
        const catalogItems = Array.isArray(catalogJson)
          ? catalogJson
          : (catalogJson.items ?? []);
        setCatalog(catalogItems as MaterialItem[]);

        // 2) Assigned projektui (turi būti tavo endpointas)
        const assignedRes = await fetch(`${apiBase}/projects/${projektasId}/materials`);
        const assignedText = await assignedRes.text();
        if (!assignedRes.ok) {
          console.error("ASSIGNED HTTP", assignedRes.status, assignedText);
          throw new Error(`Assigned HTTP ${assignedRes.status}`);
        }

        const assignedJson = JSON.parse(assignedText);
        const assignedItems = (assignedJson.items ?? assignedJson) as AssignedRow[];
        setAssigned(
          Array.isArray(assignedItems)
            ? assignedItems.map((x) => ({
                projektasId: x.projektasId ?? projektasId,
                materialKey: x.materialKey,
                quantity: clampQty(Number(x.quantity ?? 1)),
              }))
            : []
        );
      } catch (err) {
        console.error("MaterialsDndPicker load error:", err);
      }
    })();
  }, [apiBase, projektasId]);

  const assignedKeys = useMemo(() => new Set(assigned.map((x) => x.materialKey)), [assigned]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    for (const c of catalog) if (c.category) s.add(c.category);
    return ["ALL", ...Array.from(s).sort()];
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return catalog.filter((x) => {
      if (category !== "ALL" && (x.category ?? "") !== category) return false;
      if (!needle) return !assignedKeys.has(x.key);

      const hay = `${x.name} ${x.description ?? ""} ${x.category ?? ""} ${x.brand ?? ""} ${x.unit} ${
        x.sku ?? ""
      }`.toLowerCase();

      return !assignedKeys.has(x.key) && hay.includes(needle);
    });
  }, [catalog, q, category, assignedKeys]);

  const unassignedIds = useMemo(
    () => filteredCatalog.map((x) => `U:${x.key}`),
    [filteredCatalog]
  );
  const assignedIds = useMemo(
    () => assigned.map((x) => `A:${x.materialKey}`),
    [assigned]
  );

  const itemsById = useMemo(() => {
    const map: Record<string, UiItem> = {};

    for (const c of filteredCatalog) {
      const priceText =
        c.currentPrice?.price ? ` • ${c.currentPrice.price} ${c.currentPrice.currency}` : "";

      map[`U:${c.key}`] = {
        id: `U:${c.key}`,
        title: c.name,
        subtitle: `${c.unit} • ${c.category ?? "—"}${c.brand ? " • " + c.brand : ""}${priceText}`,
      };
    }

    // Assigned rodom pagal assigned (o pavadinimą/kat. imame iš catalog)
    const catalogByKey = new Map(catalog.map((m) => [m.key, m]));

    for (const a of assigned) {
      const c = catalogByKey.get(a.materialKey);
      const priceText =
        c?.currentPrice?.price ? ` • ${c.currentPrice.price} ${c.currentPrice.currency}` : "";

      map[`A:${a.materialKey}`] = {
        id: `A:${a.materialKey}`,
        title: c?.name ?? a.materialKey,
        subtitle: `${c?.unit ?? ""} • ${c?.category ?? "—"} • qty: ${a.quantity}${priceText}`,
      };
    }

    return map;
  }, [filteredCatalog, assigned, catalog]);

  async function persist(nextAssigned: AssignedRow[]) {
    setSaving(true);
    try {
      const resp = await fetch(`${apiBase}/projects/${projektasId}/materials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: nextAssigned.map((x) => ({
            materialKey: x.materialKey,
            quantity: clampQty(Number(x.quantity ?? 1)),
          })),
        }),
      });

      const text = await resp.text();
      if (!resp.ok) {
        console.error("PERSIST HTTP", resp.status, text);
        throw new Error(`Persist HTTP ${resp.status}`);
      }

      const json = JSON.parse(text);
      const items = (json.items ?? json) as AssignedRow[];

      setAssigned(
        Array.isArray(items)
          ? items.map((x) => ({
              projektasId: x.projektasId ?? projektasId,
              materialKey: x.materialKey,
              quantity: clampQty(Number(x.quantity ?? 1)),
            }))
          : nextAssigned
      );
    } catch (e) {
      console.error("persist error:", e);
      // optional: galima rodyti toast
    } finally {
      setSaving(false);
    }
  }

  const COL_U = "COL_U";
  const COL_A = "COL_A";

  async function handleDragEnd(e: DragEndEvent) {
    const actId = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;

    const a = parseId(actId);

    const overSide =
      overId === COL_A ? "A" : overId === COL_U ? "U" : parseId(overId).side;

    // U -> A
    if (a.side === "U" && overSide === "A") {
      const next = [...assigned, { projektasId, materialKey: a.key, quantity: 1 }];
      setAssigned(next);
      await persist(next);
      return;
    }

    // A -> U
    if (a.side === "A" && overSide === "U") {
      const next = assigned.filter((x) => x.materialKey !== a.key);
      setAssigned(next);
      await persist(next);
      return;
    }

    // reorder tik A stulpelyje ant kitos A kortelės
    if (a.side === "A") {
      const o = parseId(overId);
      if (o.side === "A" && a.key !== o.key) {
        const from = assigned.findIndex((x) => x.materialKey === a.key);
        const to = assigned.findIndex((x) => x.materialKey === o.key);
        if (from === -1 || to === -1) return;

        const next = [...assigned];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        setAssigned(next);
        await persist(next);
      }
    }
  }

  function updateQty(materialKey: string, qty: number) {
    const safe = clampQty(qty);
    const next = assigned.map((x) => (x.materialKey === materialKey ? { ...x, quantity: safe } : x));
    setAssigned(next);
  }

  const activeUi = activeId ? itemsById[activeId] : null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left"
      >
        <div>
          <div className="text-white font-medium">Medžiagos</div>
          <div className="text-xs text-white/60">
            Priskirta: {assigned.length} • Nepriskirta: {Math.max(0, catalog.length - assigned.length)}
          </div>
        </div>
        <div className="text-white/70 text-sm">{open ? "Uždaryti" : "Atidaryti"}</div>
      </button>

      {open ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Paieška..."
              className="w-64 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white text-sm"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white text-sm"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <div className="text-xs text-white/60 ml-auto">{saving ? "Saugoma..." : " "}</div>
          </div>

          <DndContext
            sensors={sensors}
            onDragStart={(e) => setActiveId(String(e.active.id))}
            onDragCancel={() => setActiveId(null)}
            onDragEnd={async (e) => {
              await handleDragEnd(e);
              setActiveId(null);
            }}
          >
            <div className="flex gap-4 flex-wrap">
              <Column title="Nepriskirtos" ids={unassignedIds} itemsById={itemsById} droppableId={COL_U} />

              <Column
                title="Priskirtos projektui"
                ids={assignedIds}
                itemsById={itemsById}
                droppableId={COL_A}
                renderRight={(id) => {
                  const { side, key } = parseId(id);
                  if (side !== "A") return null;

                  const row = assigned.find((x) => x.materialKey === key);
                  if (!row) return null;

                  return (
                    <input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={row.quantity}
                      onChange={(e) => updateQty(key, Number(e.target.value))}
                      onBlur={() => persist(assigned)} // persist dabartinę būseną
                      className="w-24 rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-white text-sm"
                    />
                  );
                }}
              />
            </div>

            <DragOverlay>
              {activeUi ? (
                <div
                  style={{ marginTop: -65 }} // pastumia nuo cursor
                  className="rounded-xl border border-white/10 bg-white/10 p-3 flex gap-3 select-none pointer-events-none"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-white truncate">{activeUi.title}</div>
                    <div className="text-xs text-white/60 truncate">{activeUi.subtitle}</div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      ) : null}
    </div>
  );
}
