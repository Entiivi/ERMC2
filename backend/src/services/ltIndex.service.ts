import { prisma } from "../prisma";

export type IndexGroup =
    | "CEMENT"
    | "CONCRETE"
    | "STEEL"
    | "TIMBER"
    | "INSULATION"
    | "BITUMEN"
    | "CABLES"
    | "PIPES"
    | "FASTENERS"
    | "FINISHING"
    | "ELECTRICAL_PARTS"
    | "MEP_PARTS"
    | "OTHER";

// fallback (kol DB dar tuščias)
const STUB_INDEX: Record<string, Record<string, number>> = {
    CEMENT: { "2025-01": 100, "2025-02": 101.2, "2025-03": 102.1 },
    OTHER: { "2025-01": 100, "2025-02": 100, "2025-03": 100 },
};

function latestPeriod(map: Record<string, number>) {
    return Object.keys(map).sort().at(-1)!;
}

export async function getIndex(group: IndexGroup, period?: string) {
    // 1) jei period nenurodytas -> naujausias DB
    if (!period) {
        const latest = await prisma.ltMaterialIndex.findFirst({
            where: { group },
            orderBy: { period: "desc" },
        });

        if (latest) return { period: latest.period, index: latest.value, source: latest.source ?? "DB" };

        const map = STUB_INDEX[group] ?? STUB_INDEX.OTHER;
        const p = latestPeriod(map);
        return { period: p, index: map[p], source: "STUB" };
    }


    const exact = await prisma.ltMaterialIndex.findFirst({
        where: { group, period },
    });

    if (exact) return { period: exact.period, index: exact.value, source: exact.source ?? "DB" };

    const map = STUB_INDEX[group] ?? STUB_INDEX.OTHER;
    const p = map[period] != null ? period : latestPeriod(map);
    return { period: p, index: map[p], source: "STUB" };
}
