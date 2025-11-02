// app/karjera-placiau/[id]/page.tsx  (SERVER)
import Link from "next/link";
import Image from "next/image";
import KarjeraExpanded from "@/app/components/karjeraexpanded";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ← required in new Next

  return (
    <main className="scroll-smooth min-h-screen overflow-y-auto max-w-7xl mx-auto px-[4vw] py-[5vh] relative">
      <Link
        href="/#karjera"
        aria-label="Grįžti atgal"
        className="hover:scale-110 transition-transform duration-200 cursor-pointer"
        style={{ position: "absolute", left: "12vw", top: "8vh" }}
      >
        <Image
          src="/icons/back.svg"
          alt="Atgal"
          width={24}
          height={24}
          className="hover:brightness-75"
          style={{ width: "3vh", height: "3vh" }}
        />
      </Link>

      <h1 className="text-[3vh] font-bold text-gray-800 text-center mb-[0.4vh]">
        Karjera
      </h1>

      <KarjeraExpanded id={id} />
    </main>
  );
}
