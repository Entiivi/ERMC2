"use client";

import { useSearchParams } from "next/navigation";
import { LanguageProvider } from "@/app/kalbos/LanguageContext";
import { ApieMusContentSprendimai } from "@/app/components/ServicesSection";

type Lang = "LT" | "EN";

function parseLang(v: string | null): Lang {
  return v === "EN" ? "EN" : "LT";
}

export default function ServicesPreviewPage() {
  const params = useSearchParams();
  const lang = parseLang(params.get("lang"));

  return (
    <LanguageProvider>
      <main className="min-h-screen bg-neutral-50 p-6">
        <ApieMusContentSprendimai />
      </main>
    </LanguageProvider>
  );
}
