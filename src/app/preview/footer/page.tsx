"use client";

import { useSearchParams } from "next/navigation";
import { LanguageProvider } from "@/app/kalbos/LanguageContext";
import footer from "@/app/components/footer";

type Lang = "LT" | "EN";

function parseLang(v: string | null): Lang {
  return v === "EN" ? "EN" : "LT";
}

export default function PartneriaiPreviewPage() {
  const params = useSearchParams();
  const lang = parseLang(params.get("lang"));

  return (
    <LanguageProvider>
      <main className="min-h-screen bg-neutral-50 p-6">
        <footer />
      </main>
    </LanguageProvider>
  );
}
