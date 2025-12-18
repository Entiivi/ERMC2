"use client";

import { useEffect, useMemo, useState } from "react";
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    closestCenter,
    DragOverlay,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type CatalogItem = {
    key: string;
    name: string;
    spec?: string | null;
    unit: string;
    category: string;
    sector: string;
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
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id });


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
                className={`space-y-2 rounded-xl border border-white/10 p-2 min-h-[77vh] ${isOver ? "bg-white/5" : "bg-transparent"
                    }`}
            >
                <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                    {ids.map((id: string) => (
                        <SortableCard
                            key={id}
                            id={id}
                            title={itemsById[id]?.title ?? id}
                            subtitle={itemsById[id]?.subtitle ?? ""}
                            right={renderRight?.(id)}
                        />
                    ))}
                </SortableContext>

                {ids.length === 0 ? (
                    <div className="text-xs text-white/50 p-2">Numesk čia</div>
                ) : null}
            </div>
        </div>
    );
}

function parseId(id: string) {
    const [side, key] = id.split(":");
    return { side, key };
}

export function MaterialsDndPicker({
    apiBase,
    projektasId,
}: {
    apiBase: string;
    projektasId: string;
}) {
    const [open, setOpen] = useState(false);
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [assigned, setAssigned] = useState<AssignedRow[]>([]);
    const [saving, setSaving] = useState(false);

    const [activeId, setActiveId] = useState<string | null>(null);

    // search/filter
    const [q, setQ] = useState("");
    const [sector, setSector] = useState<string>("ALL");
    console.log("MaterialsDndPicker apiBase:", apiBase, "projektasId:", projektasId);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 1,
                tolerance: 1,
            }
        })
    );

    useEffect(() => {
        (async () => {
            try {
                const catalogRes = await fetch(`${apiBase}/external/catalog`);
                const catalogText = await catalogRes.text();

                if (!catalogRes.ok) {
                    console.error("CATALOG HTTP", catalogRes.status, catalogText);
                    throw new Error(`Catalog HTTP ${catalogRes.status}`);
                }

                let catalogJson: any;
                try {
                    catalogJson = JSON.parse(catalogText);
                } catch {
                    console.error("CATALOG NOT JSON:", catalogText.slice(0, 200));
                    throw new Error("Catalog returned non-JSON");
                }

                setCatalog((catalogJson.items ?? []) as CatalogItem[]);

                const assignedRes = await fetch(`${apiBase}/projects/${projektasId}/materials`);
                const assignedText = await assignedRes.text();

                if (!assignedRes.ok) {
                    console.error("ASSIGNED HTTP", assignedRes.status, assignedText);
                    throw new Error(`Assigned HTTP ${assignedRes.status}`);
                }

                let assignedJson: any;
                try {
                    assignedJson = JSON.parse(assignedText);
                } catch {
                    console.error("ASSIGNED NOT JSON:", assignedText.slice(0, 200));
                    throw new Error("Assigned returned non-JSON");
                }

                setAssigned((assignedJson.items ?? []) as AssignedRow[]);
            } catch (err) {
                console.error("MaterialsDndPicker load error:", err);
            }
        })();
    }, [apiBase, projektasId]);

    const assignedKeys = useMemo(() => new Set(assigned.map((x: AssignedRow) => x.materialKey)), [assigned]);

    const sectors = useMemo(() => {
        const s = new Set<string>();
        for (const c of catalog) s.add(c.sector);
        return ["ALL", ...Array.from(s).sort()];
    }, [catalog]);

    const filteredCatalog = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return catalog.filter((x: CatalogItem) => {
            if (sector !== "ALL" && x.sector !== sector) return false;
            if (!needle) return !assignedKeys.has(x.key);
            const hay = `${x.name} ${x.spec ?? ""} ${x.category} ${x.sector}`.toLowerCase();
            return !assignedKeys.has(x.key) && hay.includes(needle);
        });
    }, [catalog, q, sector, assignedKeys]);

    const unassignedIds = useMemo(() => filteredCatalog.map((x: CatalogItem) => `U:${x.key}`), [filteredCatalog]);
    const assignedIds = useMemo(() => assigned.map((x: AssignedRow) => `A:${x.materialKey}`), [assigned]);

    const itemsById = useMemo(() => {
        const map: Record<string, UiItem> = {};

        for (const c of filteredCatalog) {
            map[`U:${c.key}`] = {
                id: `U:${c.key}`,
                title: c.name,
                subtitle: `${c.spec ? c.spec + " • " : ""}${c.unit} • ${c.category}`,
            };
        }

        for (const a of assigned) {
            const c = catalog.find((x: CatalogItem) => x.key === a.materialKey);
            map[`A:${a.materialKey}`] = {
                id: `A:${a.materialKey}`,
                title: c?.name ?? a.materialKey,
                subtitle: `${c?.spec ? c.spec + " • " : ""}${c?.unit ?? ""} • qty: ${a.quantity}`,
            };
        }

        return map;
    }, [filteredCatalog, assigned, catalog]);

    const activeUi = activeId ? itemsById[activeId] : null;

    async function persist(nextAssigned: AssignedRow[]) {
        setSaving(true);
        try {
            const resp = await fetch(`${apiBase}/projects/${projektasId}/materials`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: nextAssigned.map((x: AssignedRow) => ({
                        materialKey: x.materialKey,
                        quantity: x.quantity,
                    })),
                }),
            }).then((r) => r.json());

            setAssigned((resp.items ?? nextAssigned) as AssignedRow[]);
        } finally {
            setSaving(false);
        }
    }
    const COL_U = "COL_U";
    const COL_A = "COL_A";

    async function handleDragEnd(e: DragEndEvent) {
        const activeId = String(e.active.id);
        const overId = e.over?.id ? String(e.over.id) : null;
        if (!overId) return;

        const a = parseId(activeId);

        // jei numetėm į stulpelio zoną, o ne ant kortelės
        const overSide =
            overId === COL_A ? "A" :
                overId === COL_U ? "U" :
                    parseId(overId).side;

        // U -> A
        if (a.side === "U" && overSide === "A") {
            const next = [...assigned, { projektasId, materialKey: a.key, quantity: 1 }];
            setAssigned(next);
            await persist(next);
            return;
        }

        // A -> U
        if (a.side === "A" && overSide === "U") {
            const next = assigned.filter((x: AssignedRow) => x.materialKey !== a.key);
            setAssigned(next);
            await persist(next);
            return;
        }

        // reorder tik kai over yra kita A kortelė
        if (a.side === "A") {
            const o = parseId(overId);
            if (o.side === "A" && a.key !== o.key) {
                const from = assigned.findIndex((x: AssignedRow) => x.materialKey === a.key);
                const to = assigned.findIndex((x: AssignedRow) => x.materialKey === o.key);
                if (from === -1 || to === -1) return;

                const next = [...assigned];
                const [moved] = next.splice(from, 1);
                next.splice(to, 0, moved);
                setAssigned(next);
                await persist(next);
            }
        }

        console.log("drag", activeId, "over", overId);
    }

    function updateQty(materialKey: string, qty: number) {
        const next = assigned.map((x: AssignedRow) =>
            x.materialKey === materialKey ? { ...x, quantity: qty } : x
        );
        setAssigned(next);
    }

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
                        Priskirta: {assigned.length} • Nepriskirta: {catalog.length - assigned.length}
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
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                            className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white text-sm"
                        >
                            {sectors.map((s: string) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                        <div className="text-xs text-white/60 ml-auto">
                            {saving ? "Saugoma..." : " "}
                        </div>
                    </div>

                    <DndContext
                        sensors={sensors}
                        onDragStart={(e) => {
                            const id = String(e.active.id);
                            console.log("DRAG START", id); // testui
                            setActiveId(id);
                        }}
                        onDragCancel={() => setActiveId(null)}
                        onDragEnd={async (e) => {
                            await handleDragEnd(e);
                            setActiveId(null);
                        }}
                    >
                        <div className="flex gap-4 flex-wrap">

                        </div>
                        <div className="flex gap-4 flex-wrap">
                            <Column
                                title="Nepriskirtos"
                                ids={unassignedIds}
                                itemsById={itemsById}
                                droppableId={COL_U}
                            />
                            <Column
                                title="Priskirtos projektui"
                                ids={assignedIds}
                                itemsById={itemsById}
                                droppableId={COL_A}
                                renderRight={(id: string) => {
                                    const { side, key } = parseId(id);
                                    if (side !== "A") return null;

                                    const row = assigned.find((x: AssignedRow) => x.materialKey === key);
                                    if (!row) return null;

                                    return (
                                        <input
                                            type="number"
                                            min={0.01}
                                            step={0.01}
                                            value={row.quantity}
                                            onChange={(e) => updateQty(key, Number(e.target.value))}
                                            onBlur={() => persist(assigned)}
                                            className="w-24 rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-white text-sm"
                                        />
                                    );
                                }}
                            />
                        </div>

                        <DragOverlay>
                            {activeId ? (
                                <div
                                    style={{ marginTop: 30}} // pastumia nuo cursor
                                    className="rounded-xl border border-white/10 bg-white/10 p-3 flex gap-3 select-none pointer-events-none"
                                >
                                    <div className="min-w-0">
                                        <div className="font-medium text-white truncate">
                                            {itemsById[activeId]?.title ?? activeId}
                                        </div>
                                        <div className="text-xs text-white/60 truncate">
                                            {itemsById[activeId]?.subtitle ?? ""}
                                        </div>
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
