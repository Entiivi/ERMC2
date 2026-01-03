"use client";

import { useSearchParams } from "next/navigation";
import { LanguageProvider } from "@/app/kalbos/LanguageContext";
import  PatirtisPlaciauPage  from "@/app/components/patirtisexpanded";

type Lang = "LT" | "EN";

function parseLang(v: string | null): Lang {
  return v === "EN" ? "EN" : "LT";
}

export default function PartneriaiPreviewPage() {
  const params = useSearchParams();
  const lang = parseLang(params.get("lang"));

  return (
    <LanguageProvider>
      <main className="min-h-screen bg-transparent p-6 overflow-x-hidden">
        <PatirtisPlaciauPage lang={lang}/>
      </main>
    </LanguageProvider>
  );
}
