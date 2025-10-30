'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getContacts, KontaktasDTO } from '@/app/lib/api';

const CopyText: React.FC<{ text: string }> = ({ text }) => {
  const [hover, setHover] = useState(false);
  return (
    <span
      onClick={() => navigator.clipboard.writeText(text)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`ml-2 cursor-pointer text-sm select-none transition-colors ${
        hover ? 'text-teal-500' : 'text-gray-600'
      }`}
      title="Kopijuoti"
      role="button"
      aria-label="Kopijuoti reikšmę"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigator.clipboard.writeText(text)}
    >
      COPY
    </span>
  );
};

function inferLink(k: KontaktasDTO): string | undefined {
  const v = k.value.trim();
  const l = k.label.toLowerCase();
  if (v.includes('@') && !v.startsWith('http')) return `mailto:${v}`;
  const digits = v.replace(/[^\d+]/g, '');
  if ((digits.startsWith('+') || /\d/.test(digits)) && (l.includes('telefon') || l.includes('tel')))
    return `tel:${digits}`;
  if (/^https?:\/\//i.test(v)) return v;
  return undefined;
}

export default function Footer() {
  const [contacts, setContacts] = useState<KontaktasDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const resp = await getContacts();
        const data: KontaktasDTO[] = Array.isArray(resp) ? resp : resp.contacts ?? [];
        if (!cancelled) setContacts(data);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Nepavyko įkelti kontaktų');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
    {/* === TOP ROW: 2 COLUMNS === */}
    <div className="max-w-7xl mx-auto px-[4vw] py-8 grid grid-cols-2 gap-[0.5vw]">
      {/* LEFT COLUMN: Logo */}
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

      {/* RIGHT COLUMN: Contacts */}
      <div className="bg-white rounded-xl shadow-sm p-6 min-h-[220px] pt-[1vh]">


        {loading && <p className="text-sm text-gray-500">Kraunama…</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {!loading && !err && (
          <div className="space-y-2 py-[1.5vh]">
            {contacts.map((item) => {
              const link = inferLink(item);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-[2vw] py-[0.5vh]"
                >
                  {/* Label + Icon */}
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

                  {/* Value + Copy */}
                  <div className="">
                    <div className="flex gap-[1vw] text-sm text-left">
                      {link ? (
                        <a>{item.value}</a>
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

    {/* === BOTTOM ROW: COPYRIGHT === */}
    <div className="bg-white/80 mt-4">
      <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Energetikos remonto ir montavimo centras
      </div>
    </div>
  </footer>
);

}
