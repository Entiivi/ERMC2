"use client";

import { useMemo } from "react";

export function ApiePreviewPanel({
  lang,
}: {
  lang: "LT" | "EN";
}) {
  const frontendBase =
    process.env.NEXT_PUBLIC_FRONTEND_URL ?? "https://localhost:3000";

  const src = useMemo(() => {
    return `${frontendBase}/preview/apie?lang=${lang}`;
  }, [frontendBase, lang]);

  return (
    <div className="rounded-2xl bg-white/70 p-4 w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-black">
          Paslaugų sekcijos peržiūra
        </div>
        <a
          href={src}
          target="_blank"
          className="text-xs text-blue-600 hover:underline"
        >
          Atidaryti atskirai
        </a>
      </div>

      <div className="h-[520px] rounded-xl overflow-hidden bg-white">
        <iframe
          src={src}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
