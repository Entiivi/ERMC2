// File: src/app/page.tsx
"use client";

import "@/app/css/page.css";
import Image from "next/image";
import React from "react";
import { ApieMusContentSprendimai } from "@/app/components/ServicesSection";
import PatirtisSection from "@/app/components/PatirtisSection";
import { KlientaiIrPartneriai } from "@/app/components/PartneriaiSection";
import KarjeraSection from "@/app/components/KarjeraSection";
import { KontaktaiSection } from "@/app/components/KontaktaiSection";
import { ApieSection } from "@/app/components/ApieSection";
import { useLanguage } from "@/app/kalbos/LanguageContext"; // 👈 PRIDĖTA

export default function HomePage() {
  const { lang } = useLanguage(); // "LT" arba "EN"

  const [showLine, setShowLine] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setShowLine(true), 150);
    return () => clearTimeout(t);
  }, []);

  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

  // Paprasti "vertimai" titlams
  const titles = lang === "EN"
    ? {
        apieMus: "ABOUT US",
        services: "OUR SERVICES",
        experience: "EXPERIENCE",
        partners: "PARTNERS",
        career: "CAREER",
      }
    : {
        apieMus: "APIE MUS",
        services: "MŪSŲ PASLAUGOS",
        experience: "PATIRTIS",
        partners: "PARTNERIAI",
        career: "KARJERA",
      };

  const apieMusContentSprendimai = <ApieMusContentSprendimai />;
  const patirtisSection = <PatirtisSection />;
  const partneriaiSection = <KlientaiIrPartneriai />;
  const karjeraSection = <KarjeraSection />;
  const kontaktaiSection = <KontaktaiSection />;
  const apieMusContentApie = <ApieSection />;

  const sections = [
    {
      title1: titles.apieMus,
      content1: apieMusContentApie,
      imageSrc1: "/photos/apiefoto.png",
      imageAlt1: "EMRC team working",
    },
    {
      title2: titles.services,
      content2: apieMusContentSprendimai,
    },
    {
      title3: titles.experience,
      content3: patirtisSection,
      imageSrc3: "...",
      imageAlt3: "EMRC team working",
    },
    {
      title4: titles.partners,
      content4: partneriaiSection,
      imageSrc4: "...",
      imageAlt4: "EMRC team working",
    },
    {
      title5: titles.career,
      content5: karjeraSection,
      imageSrc5: "...",
      imageAlt5: "EMRC team working",
    },
    // Jei norėsi kontaktų kaip atskiro bloko:
    // {
    //   title6: lang === "EN" ? "CONTACTS" : "KONTAKTAI",
    //   content6: kontaktaiSection,
    //   imageSrc6: "...",
    //   imageAlt6: "EMRC team working",
    // },
  ];

  const HEADER_HEIGHT_VH = 5;

  const blocks = sections.flatMap((s) => {
    const arr: {
      title: string;
      content: React.ReactNode;
      imageSrc?: string;
      imageAlt?: string;
      id: string;
    }[] = [];

    if (s.title1) {
      arr.push({
        title: s.title1,
        content: s.content1!,
        imageSrc: s.imageSrc1,
        imageAlt: s.imageAlt1,
        id: "apie-mus",
      });
    }

    if (s.title2) {
      arr.push({
        title: s.title2,
        content: s.content2!,
        id: "musu-paslaugos",
      });
    }

    if (s.title3) {
      arr.push({
        title: s.title3,
        content: s.content3!,
        id: "patirtis",
      });
    }

    if (s.title4) {
      arr.push({
        title: s.title4,
        content: s.content4!,
        id: "partneriai",
      });
    }

    if (s.title5) {
      arr.push({
        title: s.title5,
        content: s.content5!,
        id: "karjera",
      });
    }

    return arr;
  });

  return (
    <div
      className="snap-y snap-mandatory overflow-visible h-auto"
      style={{
        scrollBehavior: "smooth",
        scrollPaddingTop: `${HEADER_HEIGHT_VH}vh`,
      }}
    >
      {/* Hero slide */}
      <section
        className="snap-start relative"
        style={{
          height: `calc(100vh - ${HEADER_HEIGHT_VH}vh)`,
          width: "100%",
          scrollMarginTop: `${HEADER_HEIGHT_VH}vh`,
        }}
      >
        <Image
          src="/hero3.png"
          alt="Hero background"
          fill
          priority
          quality={100}
          style={{
            objectFit: "cover",
            objectPosition: "center",
            WebkitMaskImage:
              "linear-gradient(to bottom, white 50%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, white 50%, transparent 100%)",
          }}
          sizes="(min-width: 1024px) 100vw, 100vw"
        />
      </section>

      {/* Content slides */}
      {blocks.map((block, i) => (
        <section
          id={block.id}
          key={i}
          className="snap-start flex flex-col bg-white"
          style={{
            minHeight: `calc(100vh - ${HEADER_HEIGHT_VH}vh)`,
            scrollSnapAlign: "start",
            scrollMarginTop: `${HEADER_HEIGHT_VH}vh`,
          }}
        >
          {/* Title area */}
          <div className="px-[3vw] pt-4 text-center">
            <h2 className="text-[5vh] font-semibold">{block.title}</h2>
            <div
              className={`mt-2 h-1 bg-red-500 rounded mx-auto ${
                showLine ? "w-40 opacity-100" : "w-0 opacity-0"
              }`}
            />
          </div>

          {/* Main content */}
          <div className="flex w-full max-w-6xl mx-auto mt-6 pb-0">
            {block.imageSrc && (
              <div
                className="relative flex-shrink-0 mr-6"
                style={{ width: "40vw", height: "60vh" }}
              >
                <Image
                  src={block.imageSrc}
                  alt={block.imageAlt ?? block.title}
                  fill
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
                />
              </div>
            )}
            <div
              className={`${block.imageSrc ? "flex-grow" : "w-full"}`}
              style={{
                fontSize: "3vh",
              }}
            >
              {block.content}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
