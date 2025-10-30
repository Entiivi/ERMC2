// app/karjera-placiau/[id]/page.tsx
import Link from "next/link";
import Image from "next/image";
import KarjeraExpanded from "@/app/components/karjeraexpanded";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <main
      className="scroll-smooth min-h-screen overflow-y-auto max-w-7xl mx-auto px-[4vw] py-[5vh] relative"
      style={{ position: "relative" }}
    >
      <Link
        href="/#karjera"
        aria-label="Grįžti atgal"
        className="hover:scale-110 transition-transform duration-200 cursor-pointer"
        style={{ position: "absolute", left: "12vw", top: "8vh" }}
      >
        <Image
          src="/icons/back.svg"
          alt="Atgal"
          width={0}
          height={0}
          style={{ width: "3vh", height: "3vh" }}
          className="hover:brightness-75"
        />
      </Link>

      <h1
        className="text-[3vh] font-bold text-gray-800 text-center mb-[0.4vh]"
        style={{ paddingTop: "1vh", paddingBottom: "0vh" }}
      >
        Karjera
      </h1>

      <KarjeraExpanded id={params.id} />
    </main>
  );
}
