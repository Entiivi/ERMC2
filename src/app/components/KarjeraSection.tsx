'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getJobs, DarbasDTO } from '@/app/lib/api';

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
        const data = await getJobs();
        if (!cancelled) setJobs(data);
      } catch (e: unknown) {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : 'Nepavyko įkelti darbo pasiūlymų');
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
        <p className="text-left pl-[6vw]">
          Šiuo metu aktyviai ieškome:
        </p>

        {/* Job listings */}
        <ul className="list-decimal list-inside space-y-8 px-[6vw]">
          {loading && <p className="text-gray-500">Kraunama…</p>}
          {err && <p className="text-red-600">{err}</p>}

          {!loading && !err && jobs.length === 0 && (
            <p className="text-gray-500">Šiuo metu nėra laisvų darbo vietų.</p>
          )}

          {!loading &&
            !err &&
            jobs.map((job, idx) => (
              <ul key={job.id || idx} className="leading-relaxed">
                <div>
                  <strong className="text-gray-900 text-[2.5vh]">{job.title}</strong>
                  {job.description && (
                    <p className="text-gray-700 mt-1 text-[2vh]">
                      {job.description}
                    </p>
                  )}
                </div>

                {/* Individual "Daugiau" button */}
                <div className="flex justify-center mt-3 pr-[3.5vw]">
                  <a
                    onClick={() => router.push(`/karjera-placiau/${job.id}`)}
                    className="hover:scale-105 hover:text-[#14b8a6] transition duration-200 px-4 py-2 cursor-pointer select-none text-gray-800 rounded-full shadow-md transition duration-300 text-[2vh]"
                    style={{
                      fontWeight: '10',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Plačiau
                  </a>
                </div>
              </ul>
            ))}
        </ul>
      </div>
    </section>
  );
}
