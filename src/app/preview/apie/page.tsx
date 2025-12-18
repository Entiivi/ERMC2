"use client";

import { useSearchParams } from "next/navigation";
import { LanguageProvider } from "@/app/kalbos/LanguageContext";
import { ApieSection } from "@/app/components/ApieSection";
import Image from "next/image";

type Lang = "LT" | "EN";

function parseLang(v: string | null): Lang {
    return v === "EN" ? "EN" : "LT";
}

export default function ApiePreviewPage() {
    const params = useSearchParams();
    const lang = parseLang(params.get("lang"));

    return (
        <LanguageProvider>
            <main className="min-h-screen bg-neutral-50 p-6 flex flex-row md:flex-row gap-8">

                {/* LEFT COLUMN – IMAGE */}
                <div className="md:w-1/2 flex items-center justify-center">
                    <Image
                        src="/photos/apiefoto.png"
                        alt="Apie mus"
                        width={800}
                        height={600}
                        className="rounded-xl object-cover w-full h-auto"
                        style={{
                            objectFit: "cover",
                            objectPosition: "center",
                            WebkitMaskImage: `
                      linear-gradient(to top, transparent 0%, white 50%),
                      linear-gradient(to bottom, transparent 0%, white 50%),
                      linear-gradient(to left, transparent 0%, white 50%),
                      linear-gradient(to right, transparent 0%, white 15%)`,
                            WebkitMaskComposite: "intersect",
                            maskComposite: "intersect",
                        }}
                        priority
                    />
                </div>

                {/* RIGHT COLUMN – TEXT */}
                <div className="md:w-1/2 flex items-center">
                    <ApieSection />
                </div>

            </main>
        </LanguageProvider>
    );
}
