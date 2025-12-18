import { LT_MATERIAL_CATALOG } from "../config/ltMaterialCatalog";
import { prisma } from "../prisma";

export async function getPriceSeries(input: { key: string }) {
  const item = LT_MATERIAL_CATALOG.find(x => x.key === input.key);
  if (!item) throw new Error(`Unknown material key: ${input.key}`);

  const basePrice = Number(item.base.price);
  const basePeriod = String(item.base.period);

  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    throw new Error(`Base price not set for ${item.key}. Fill base.price in catalog.`);
  }

  const group = String(item.indexGroup);

  // imame visą indekso seriją iš DB
  const rows = await prisma.ltMaterialIndex.findMany({
    where: { group },
    orderBy: { period: "asc" },
  });

  if (!rows.length) {
    throw new Error(`No index data in DB for group=${group}. Use /external/index/upsert first.`);
  }

  const baseRow = rows.find(r => r.period === basePeriod);
  if (!baseRow) {
    throw new Error(`Base index missing in DB for group=${group}, period=${basePeriod}. Insert it via /external/index/upsert.`);
  }

  const baseIndex = Number(baseRow.value);

  const series = rows.map(r => {
    const idx = Number(r.value);
    const price = basePrice * (idx / baseIndex);
    return {
      time: r.period,          // "YYYY-MM"
      value: Number(price.toFixed(4)), // EUR/unit
      index: idx,
      indexSource: r.source ?? null,
    };
  });

  return {
    ok: true as const,
    key: item.key,
    name: item.name,
    spec: item.spec ?? null,
    unit: item.unit,
    method: "Base price adjusted by DB index series",
    base: {
      price: basePrice,
      period: basePeriod,
      index: baseIndex,
      sourceNote: item.base.sourceNote,
    },
    index: {
      group,
      points: rows.length,
    },
    series,
  };
}
