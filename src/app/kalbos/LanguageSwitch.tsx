"use client";

import React from "react";
import { useLanguage } from "@/app/kalbos/LanguageContext";

export const LanguageSwitch: React.FC = () => {
  const { lang, toggleLang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={() => setLang("LT")}
        className={`px-2 py-1 rounded ${
          lang === "LT" ? "bg-black text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        LT
      </button>
      <button
        onClick={() => setLang("EN")}
        className={`px-2 py-1 rounded ${
          lang === "EN" ? "bg-black text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        EN
      </button>
    </div>
  );
};
