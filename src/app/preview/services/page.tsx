"use client";

import { useEffect, useState } from "react";
import LanguageProviderClient from "@/app/kalbos/LanguageProviderClient";
import { useLanguage } from "@/app/kalbos/LanguageContext";
import { ApieMusContentSprendimai } from "@/app/components/ServicesSection";

type Lang = "LT" | "EN";

function PreviewLangBridge({ lang }: { lang: Lang }) {
  const { setLang } = useLanguage();

  useEffect(() => {
    setLang(lang);
  }, [lang, setLang]);

  return null;
}

export default function ServicesPreviewPage() {
  const [lang, setLang] = useState<Lang>("LT");

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const allowedOrigin =
        process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";

      if (e.origin !== allowedOrigin) return;

      if (e.data?.type === "PREVIEW_LANG") {
        setLang(e.data.lang === "EN" ? "EN" : "LT");
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <LanguageProviderClient>
      <PreviewLangBridge lang={lang} />
      <main className="min-h-screen bg-neutral-50 p-6">
        <ApieMusContentSprendimai />
      </main>
    </LanguageProviderClient>
  );
}
