"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";

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
    const [data, setData] = useState<ProjectDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                setLoading(true);
                setErr(null);
                const res = await api<ApiResp>("/projects");
                if (!cancelled) setData(res.projects.slice(0, 4)); // only 4
            } catch (e: any) {
                if (!cancelled) setErr(e?.message ?? "Nepavyko įkelti duomenų");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="w-full">
            {/* Būsena */}
            {loading && <p className="text-sm text-gray-500">Kraunama…</p>}
            {err && <p className="text-sm text-red-600">{err}</p>}

            {/* Kortelių tinklelis – išlaikytas identiškas stilius */}
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
                        onClick={() => router.push(`/patirtis-placiau/${p.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                                router.push(`/patirtis-placiau/${p.id}`);
                        }}
                        aria-label={`Atidaryti projektą: ${p.title}`}
                    >
                        {/* Viršelis */}
                        <div
                            className="h-40 w-full bg-center bg-cover"
                            style={{
                                backgroundImage: `url(${p.cover})`,
                                WebkitMaskImage:
                                    "linear-gradient(to bottom, white 50%, transparent 100%)",
                                maskImage:
                                    "linear-gradient(to bottom, white 50%, transparent 100%)",
                            }}
                        />
                        {/* Turinys */}
                        <div className="p-4">
                            <time className="text-xs text-gray-500 mb-2 block">
                                {new Date(p.date).toLocaleDateString("lt-LT", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
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

            {/* Mygtukas „Daugiau“ – išlaikytas vizualiai suderintas stilius */}
            <div className="flex justify-center mt-8">
                <a
                    onClick={() => router.push("/patirtis-placiau")}
                    className="hover:scale-105 hover:text-[#14b8a6] transition duration-200 px-6 py-3 cursor-pointer select-none text-gray-800 rounded-full shadow-md hover:bg-blue-700 transition duration-300"
                    style={{
                        
                        fontSize: "2.2vw",
                        fontWeight: "500",
                        letterSpacing: "0.02em",
                    }}
                >
                    Daugiau
                </a>
            </div>
        </section>
    );
} 