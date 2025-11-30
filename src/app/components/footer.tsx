"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/app/kalbos/LanguageContext";

type Lang = "LT" | "EN";

export interface KontaktasDTO {
  id: string;
  lang: Lang;
  label: string;
  value: string;
  copyable: boolean;
  icon?: string | null;
  createdAt: string;
  updatedAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const CopyText: React.FC<{ text: string }> = ({ text }) => {
  const [hover, setHover] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Nepavyko nukopijuoti:", err);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCopy();
    }
  };

  return (
    <span
      onClick={handleCopy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`ml-2 cursor-pointer text-sm select-none transition-colors ${
        hover ? "text-teal-500" : "text-gray-600"
      }`}
      title="Kopijuoti"
      role="button"
      aria-label="Kopijuoti reikšmę"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      COPY
    </span>
  );
};

function inferLink(k: KontaktasDTO): string | undefined {
  const v = k.value.trim();
  const l = k.label.toLowerCase();

  // el. paštas
  if (v.includes("@") && !v.startsWith("http")) return `mailto:${v}`;

  // telefonas
  const digits = v.replace(/[^\d+]/g, "");
  if (
    (digits.startsWith("+") || /\d/.test(digits)) &&
    (l.includes("telefon") || l.includes("tel"))
  ) {
    return `tel:${digits}`;
  }

  // pilnas URL
  if (/^https?:\/\//i.test(v)) return v;

  return undefined;
}

export default function Footer() {
  const { lang } = useLanguage();
  const [contacts, setContacts] = useState<KontaktasDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // kviečiam TAVO backend route
        const res = await fetch(`${API}/kontaktai?lang=${lang}`);
        if (!res.ok) {
          throw new Error(`Serverio klaida: ${res.status}`);
        }

        const data = (await res.json()) as KontaktasDTO[];

        if (!cancelled) {
          setContacts(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancelled) {
          const msg =
            e instanceof Error ? e.message : "Nepavyko įkelti kontaktų";
          setErr(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lang]);

  // jei nori papildomai filtruoti, gali, bet /kontaktai?lang= jau grąžina pagal kalbą
  const visibleContacts = contacts; // .filter((c) => c.lang === lang);

  return (
    <footer
      id="kontaktai"
      className="bg-[#f6f6f6] text-gray-800 w-full rounded-t-[1.5rem]"
      style={{
        boxShadow: "0 -10px 20px rgba(0, 0, 0, 0.07)",
        borderTopLeftRadius: "25px",
        borderTopRightRadius: "25px",
      }}
    >
      <div className="max-w-7xl mx-auto px-[4vw] py-8 grid grid-cols-2 gap-[0.5vw]">
        {/* Logo blokas */}
        <div className="flex items-center justify-center bg-white rounded-xl shadow-sm p-6 min-h-[220px]">
          <div className="relative w-[10vw] h-[10vh]">
            <Image
              src="/EMRC-1.svg"
              alt="ERMC logo"
              fill
              sizes="40vw, 40vw"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Kontaktų blokas */}
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[220px] pt-[1vh]">
          {loading && <p className="text-sm text-gray-500">Kraunama…</p>}
          {err && <p className="text-sm text-red-600">{err}</p>}

          {!loading && !err && (
            <div className="space-y-2 py-[1.5vh] pt-[6vh]">
              {visibleContacts.map((item) => {
                const link = inferLink(item);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-[2vw] py-[0.5vh]"
                  >
                    <div className="flex items-left gap-[1vw] text-right">
                      {item.icon && (
                        <Image
                          src={item.icon}
                          alt=""
                          width={18}
                          height={18}
                          className="opacity-100 invert-0 brightness-0"
                          style={{ filter: "brightness(0) saturate(100%)" }}
                        />
                      )}
                      <span className="font-medium whitespace-nowrap">
                        {item.label}:
                      </span>
                    </div>

                    <div>
                      <div className="flex gap-[1vw] text-sm text-left">
                        {link ? (
                          <a
                            href={link}
                            target={link.startsWith("http") ? "_blank" : undefined}
                            rel={
                              link.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <span>{item.value}</span>
                        )}
                        {item.copyable && <CopyText text={item.value} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/80 mt-4">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Energetikos remonto ir montavimo centras
        </div>
      </div>
    </footer>
  );
}
