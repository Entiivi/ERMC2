"use client";

import { MaterialsDndPicker } from "./SectionMaterialsDndPicker";

export function SectionMaterials({
  apiBase,
  projektasId,
}: {
  apiBase: string;
  projektasId: string;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-black/70">
        Drag & drop iš „Nepriskirtos“ į „Priskirtos projektui“.
      </div>
      <MaterialsDndPicker apiBase={apiBase} projektasId={projektasId} />
    </div>
  );
}
