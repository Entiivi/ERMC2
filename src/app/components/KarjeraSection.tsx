"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/app/kalbos/LanguageContext";

// ---- Types ----
type DarbasDTO = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  type?: string | null;
  salary?: string | null;
  postedAt: string;
  responsibilities: string[];
};

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function KarjeraSection() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [jobs, setJobs] = useState<DarbasDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // siunčiam kalbos parametrą į backendą
        const res = await fetch(`${BASE}/darbas?lang=${lang}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (!cancelled) setJobs(data);
      } catch (e: unknown) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Nepavyko įkelti darbo pasiūlymų");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lang]); // kai pasikeičia kalba, persikrauna sąrašas

  return (
    <section className="pb-[5vh] flex justify-center" id="karjera">
      <div className="w-full max-w-2xl">
        <p className="text-left pl-[6vw]">
          {lang === "EN" ? "We are currently looking for:" : "Šiuo metu aktyviai ieškome:"}
        </p>

        <div className="space-y-8 px-[6vw]">
          {loading && (
            <p className="text-gray-500">
              {lang === "EN" ? "Loading…" : "Kraunama…"}
            </p>
          )}

          {err && <p className="text-red-600">{err}</p>}

          {!loading && !err && jobs.length === 0 && (
            <p className="text-gray-500">
              {lang === "EN"
                ? "Currently no open positions."
                : "Šiuo metu nėra laisvų darbo vietų."}
            </p>
          )}

          {!loading && !err && (
            <div className="mt-6 px-[6vw] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-transform duration-300 hover:scale-[1.02] cursor-pointer p-5 flex flex-col justify-between hover:border-2 hover:border-transparent hover:bg-gradient-to-br hover:from-[#14b8a6]/10 hover:to-[#0d9488]/10"
                  onClick={() => router.push(`/karjera-placiau/${job.id}?lang=${lang}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      router.push(`/karjera-placiau/${job.id}?lang=${lang}`);
                    }
                  }}
                  aria-label={`Plačiau apie: ${job.title}`}
                >
                  <div>
                    <time className="block text-[2vh] text-gray-500 mb-1">
                      {job.postedAt
                        ? new Date(job.postedAt).toLocaleDateString(
                            lang === "EN" ? "en-GB" : "lt-LT",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : null}
                    </time>

                    <h3 className="text-gray-900 text-[2.5vh] font-semibold">
                      {job.title}
                    </h3>

                    <div className="mt-3 text-[2vh] text-gray-600 pl-[0.5vw] flex flex-col gap-1">
                      {job.location && (
                        <span>
                          {lang === "EN" ? "Location" : "Vieta"}: {job.location}
                        </span>
                      )}
                      {job.type && (
                        <span>
                          {lang === "EN" ? "Type" : "Tipas"}: {job.type}
                        </span>
                      )}
                      {job.salary && (
                        <span>
                          {lang === "EN" ? "Salary" : "Atlyginimas"}: {job.salary}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end items-center gap-2 pr-[0.5vw]">
                    <span className="text-[2vh] text-teal-600 font-medium transition-colors duration-300 group-hover:text-[#0d9488]">
                      {lang === "EN" ? "More" : "Plačiau"}
                    </span>
                    <Image
                      src="/icons/arrow.svg"
                      alt={lang === "EN" ? "More" : "Plačiau"}
                      width={0}
                      height={0}
                      style={{ width: "2.8vw", height: "2.8vh" }}
                      className="brightness-0 hover:opacity-80 transition-transform duration-300 hover:translate-x-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
