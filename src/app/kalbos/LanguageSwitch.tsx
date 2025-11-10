"use client";

import React from "react";
import { useLanguage } from "@/app/kalbos/LanguageContext";

export const LanguageSwitch: React.FC = () => {
  const { lang, toggleLang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-[0.3vw] text-sm">
      <a
        onClick={() => setLang("LT")}
        className={`hover:scale-105 hover:text-[#14b8a6] transition duration-200 px-6 py-3 cursor-pointer select-none text-gray-800 rounded-full shadow-md hover:bg-blue-700 transition duration-300 ${lang === "LT" ? "bg-black text-white" : "bg-gray-200 text-gray-800"
          }`}
      >
        LT
      </a>
      <a
        onClick={() => setLang("EN")}
        className={`hover:scale-105 hover:text-[#14b8a6] transition duration-200 px-6 py-3 cursor-pointer select-none text-gray-800 rounded-full shadow-md hover:bg-blue-700 transition duration-300 ${lang === "EN" ? "bg-black text-white" : "bg-gray-200 text-gray-800"
          }`}
      >
        EN
      </a>
    </div>
  );
};
