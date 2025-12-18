import { LT_MATERIAL_CATALOG } from "../config/ltMaterialCatalog";
import { getIndex } from "./ltIndex.service";

export async function estimatePrice(input: { key: string; quantity: number; atPeriod?: string }) {
  const item = LT_MATERIAL_CATALOG.find((x) => x.key === input.key);
  if (!item) throw new Error(`Unknown material key: ${input.key}`);

  const qty = Number(input.quantity);
  if (!Number.isFinite(qty) || qty <= 0) throw new Error("Quantity must be > 0");

  const basePrice = Number(item.base.price);
  const basePeriod = String(item.base.period);

  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    throw new Error(`Base price not set for ${item.key}. Fill base.price in catalog.`);
  }

  // SVARBU: await, nes getIndex yra async
  const baseIdx = await getIndex(item.indexGroup as any, basePeriod);
  const curIdx = await getIndex(item.indexGroup as any, input.atPeriod);

  if (!Number.isFinite(baseIdx.index) || !Number.isFinite(curIdx.index)) {
    throw new Error(`Index missing/invalid for group=${item.indexGroup} (base=${basePeriod}, at=${input.atPeriod ?? "latest"})`);
  }

  const unitPrice = basePrice * (curIdx.index / baseIdx.index);
  const total = unitPrice * qty;

  return {
    ok: true as const,
    key: item.key,
    name: item.name,
    spec: item.spec ?? null,
    unit: item.unit,
    quantity: qty,
    estimatedUnitPrice: Number(unitPrice.toFixed(4)),
    estimatedTotal: Number(total.toFixed(4)),
    currency: "EUR" as const,
    method: "Reference price adjusted by LT index (DB → fallback STUB)",
    base: {
      price: basePrice,
      period: basePeriod,
      sourceNote: item.base.sourceNote,
      indexAtBase: baseIdx.index,
      indexSource: baseIdx.source,
    },
    index: {
      group: item.indexGroup,
      period: curIdx.period,
      value: curIdx.index,
      source: curIdx.source,
    },
  };
}
