"use client";

import React from "react";
import { LanguageProvider } from "./LanguageContext";

export default function LanguageProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
