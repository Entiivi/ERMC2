"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useLanguage } from "@/app/kalbos/LanguageContext"; // 👈 PRIDĖTA

type ProjectDTO = {
  id: string;
  title: string;
  date: string; // ISO
  cover: string;
  tech: any[];
  tags: string[];
  excerpt?: string;
  link?: string;
};

type ApiResp = { projects: ProjectDTO[]; tags: string[] };

export default function PatirtisSection() {
  const router = useRouter();
  const { lang } = useLanguage(); // 👈 AKTYVI KALBA (LT/EN)
  const [data, setData] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setErr(null);

        // 👇 Siunčiam kalbos parametrą į backendą
        const res = await api<ApiResp>(`/projektai?lang=${lang}`);
        if (!cancelled) setData(res.projects.slice(0, 4)); // only 4
      } catch (e: any) {
        if (!cancelled)
          setErr(e?.message ?? (lang === "EN" ? "Failed to load data" : "Nepavyko įkelti duomenų"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [lang]); // 👈 kai pasikeičia kalba, refetch'inam

  // Kai vartotojas spaudžia ant projekto ar mygtuko „Daugiau“:
  function openMorePage() {
    router.push(`/patirtis-placiau?lang=${lang}`);
  }

  return (
    <section className="w-full">
      {/* Būsena */}
      {loading && <p className="text-sm text-gray-500">{lang === "EN" ? "Loading…" : "Kraunama…"}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      {/* Kortelių tinklelis */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4vw",
          paddingLeft: "7vw",
        }}
      >
        {data.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer"
            style={{
              flex: "0 0 calc((100% - 4vw) / 2)",
              maxWidth: "calc((100% - 4vw) / 2)",
            }}
            onClick={openMorePage}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openMorePage();
            }}
          >
            {/* Viršelis */}
            <div
              className="h-40 w-full bg-center bg-cover"
              style={{
                backgroundImage: `url(${p.cover})`,
                WebkitMaskImage: "linear-gradient(to bottom, white 50%, transparent 100%)",
                maskImage: "linear-gradient(to bottom, white 50%, transparent 100%)",
              }}
            />
            {/* Turinys */}
            <div className="p-4">
              <time className="text-xs text-gray-500 mb-2 block">
                {new Date(p.date).toLocaleDateString(
                  lang === "EN" ? "en-GB" : "lt-LT",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </time>
              <h3
                className="text-[2vw] text-gray-800 leading-snug text-left whitespace-normal break-words"
                style={{ fontWeight: "normal" }}
              >
                {p.title}
              </h3>

              {!!p.tech?.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tech.slice(0, 4).map((t, i) => (
                    <span
                      key={`${p.id}-tech-${i}`}
                      className="text-[10px] px-2 py-0.5 rounded bg-gray-100 border"
                    >
                      {String(t)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mygtukas „Daugiau“ */}
      <div className="flex justify-center mt-8">
        <a
          onClick={openMorePage}
          className="hover:scale-105 hover:text-[#14b8a6] transition duration-200 px-6 py-3 cursor-pointer select-none text-gray-800 rounded-full shadow-md hover:bg-blue-700 transition duration-300"
          style={{
            fontSize: "2.2vw",
            fontWeight: "500",
            letterSpacing: "0.02em",
          }}
        >
          {lang === "EN" ? "More" : "Daugiau"}
        </a>
      </div>
    </section>
  );
}
