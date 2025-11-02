"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ---- Types (match your new backend DTO) ----
type DarbasDTO = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  type?: string | null;
  salary?: string | null;
  postedAt: string;           // ISO string
  responsibilities: string[]; // normalized array
};

// ---- Client fetch helper (browser-safe) ----
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
async function fetchJobs(): Promise<DarbasDTO[]> {
  const res = await fetch(`${BASE}/darbas`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function KarjeraSection() {
  const router = useRouter();
  const [jobs, setJobs] = useState<DarbasDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchJobs();
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
  }, []);

  return (
    <section className="flex justify-center" id="karjera">
      <div className="w-full max-w-2xl">
        <p className="text-left pl-[6vw]">Šiuo metu aktyviai ieškome:</p>

        {/* Job listings */}
        <div className="space-y-8 px-[6vw]">
          {loading && <p className="text-gray-500">Kraunama…</p>}
          {err && <p className="text-red-600">{err}</p>}

          {!loading && !err && jobs.length === 0 && (
            <p className="text-gray-500">Šiuo metu nėra laisvų darbo vietų.</p>
          )}

          {!loading &&
            !err &&
            jobs.map((job) => (
              <div key={job.id} className="leading-relaxed">
                <div>
                  <time className="block text-xs text-gray-500">
                    {job.postedAt
                      ? new Date(job.postedAt).toLocaleDateString("lt-LT", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : null}
                  </time>

                  <strong className="text-gray-900 text-[2.5vh]">{job.title}</strong>

                  {/* Optional short description */}
                  {job.description && (
                    <p className="text-gray-700 mt-1 text-[2vh]">{job.description}</p>
                  )}

                  {/* Optional meta row */}
                  <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-4">
                    {job.location && <span>Vieta: {job.location}</span>}
                    {job.type && <span>Tipas: {job.type}</span>}
                    {job.salary && <span>Atlyginimas: {job.salary}</span>}
                  </div>

                  {/* Optional first 2 responsibilities */}
                  {job.responsibilities?.length ? (
                    <ul className="mt-3 list-disc pl-6 text-gray-800 space-y-1">
                      {job.responsibilities.slice(0, 2).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {/* "Plačiau" button */}
                <div className="flex justify-center mt-3 pr-[3.5vw]">
                  <button
                    onClick={() => router.push(`/karjera-placiau/${job.id}`)}
                    className="hover:scale-105 hover:text-[#14b8a6] transition duration-200 px-4 py-2 cursor-pointer select-none text-gray-800 rounded-full shadow-md text-[2vh]"
                    style={{ fontWeight: 500, letterSpacing: "0.02em" }}
                    aria-label={`Plačiau apie: ${job.title}`}
                  >
                    Plačiau
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
