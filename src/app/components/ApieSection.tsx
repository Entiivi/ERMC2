"use client";

import React, { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const ApieSection: React.FC = () => {
    const [apieText, setApieText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`${API}/apie`);
                if (!res.ok) throw new Error("Nepavyko gauti 'Apie mus' duomenų");

                const data = await res.json() as { content: string }[];

                const text = data.map((d) => d.content).join("\n\n");

                if (!cancelled) setApieText(text);
            } catch (err: any) {
                if (!cancelled)
                    setError(err?.message ?? "Nepavyko įkelti 'Apie mus' duomenų");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="px-[3vw] text-[2.5vh] pt-[3vh] whitespace-pre-line">
            {loading && <p>Kraunama...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && apieText && (
                <div>
                    {apieText
                        .split(/(?<=[.!?])\s+/) // split after ., !, or ?
                        .filter((line) => line.trim().length > 0)
                        .map((sentence, idx) => (
                            <p key={idx} className="mb-2">{sentence.trim()}</p>
                        ))}
                </div>
            )}
            {!loading && !error && !apieText && (
                <p>Kol kas nėra „Apie mus“ turinio.</p>
            )}
        </div>
    );
};
