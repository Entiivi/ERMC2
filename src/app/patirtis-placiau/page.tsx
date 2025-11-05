"use client";

import PatirtisExpanded from "@/app/components/patirtisexpanded";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PatirtisPlaciauPage() {
  const router = useRouter();

  return (
    <main
      className="scroll-smooth min-h-screen overflow-y-auto max-w-7xl mx-auto px-[4vw] py-[5vh] relative"
      style={{ position: "relative" }}
    >
      <a
        onClick={() => router.push("/#patirtis")}
        className="hover:scale-110 transition-transform duration-200 cursor-pointer"
        style={{
          position: "absolute",
          left: "12vw",
          top: "8vh",
        }}
        aria-label="Grįžti atgal"
      >
        <Image
          src="/icons/back.svg"
          alt="Atgal"
          width={0}
          height={0}
          style={{
            width: "3vh",
            height: "3vh",
          }}
          className="hover:brightness-75"
        />
      </a>

      {/* Centered title with vw/vh padding */}
      <h1
        className="text-[3vh] font-bold text-gray-800 text-center mb-[0.4vh]"
        style={{
          paddingTop: "1vh",
          paddingBottom: "0vh",
        }}
      >
        Projektų galerija
      </h1>
      <PatirtisExpanded />
    </main>
  );
}
