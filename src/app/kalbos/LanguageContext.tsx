"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type LangCode = "LT" | "EN";

type LanguageContextValue = {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  toggleLang: () => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LangCode>("LT");

  // load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("site-lang") as LangCode | null;
    if (stored === "LT" || stored === "EN") {
      setLangState(stored);
    }
  }, []);

  const setLang = (value: LangCode) => {
    setLangState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("site-lang", value);
    }
  };

  const toggleLang = () => {
    setLang(lang === "LT" ? "EN" : "LT");
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
