// app/karjera-placiau/[id]/page.tsx
import Link from "next/link";
import Image from "next/image";
import KarjeraExpanded from "@/app/components/karjeraexpanded"; // 👈 svarbu tas pats case kaip faile

type PageParams = { id: string };
type PageSearchParams = { lang?: string };

type PageProps = {
  params: Promise<PageParams>;
  searchParams: Promise<PageSearchParams>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;

  const raw = (sp?.lang || "").toUpperCase();
  const lang = raw === "EN" ? "EN" : "LT"; // default LT

  return (
    <main className="scroll-smooth min-h-screen overflow-y-auto max-w-7xl mx-auto px-[4vw] py-[5vh] relative">
      <Link
        href="/#karjera"
        aria-label={lang === "EN" ? "Go back" : "Grįžti atgal"}
        className="hover:scale-110 transition-transform duration-200 cursor-pointer"
        style={{ position: "absolute", left: "12vw", top: "8vh" }}
      >
        <Image
          src="/icons/back.svg"
          alt={lang === "EN" ? "Back" : "Atgal"}
          width={24}
          height={24}
          className="hover:brightness-75"
          style={{ width: "3vh", height: "3vh" }}
        />
      </Link>

      <h1 className="text-[3vh] font-bold text-gray-800 text-center mb-[0.4vh]">
        {lang === "EN" ? "Careers" : "Karjera"}
      </h1>

      <KarjeraExpanded id={id} lang={lang} />
    </main>
  );
}
