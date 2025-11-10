"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/app/lib/api";
import { useLanguage } from "@/app/kalbos/LanguageContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ServiceDTO = {
  id: string;
  title: string;
  subtitle: string;
  iconUrl: string; // pvz. "/uploads/icons/mirp.svg" arba pilnas URL
  details: string;
};

export const ApieMusContentSprendimai = () => {
  const { lang } = useLanguage(); // "LT" arba "EN"

  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const ICON_STYLE: React.CSSProperties = {
    width: "10vw",
    height: "10vh",
    filter: "grayscale(100%) brightness(0)",
  };

  // UI tekstai pagal kalbą
  const uiText = lang === "EN"
    ? {
      loading: "Loading services…",
      error: "Failed to load services.",
    }
    : {
      loading: "Kraunamos paslaugos…",
      error: "Nepavyko įkelti paslaugų.",
    };

  // Užkraunam paslaugas iš backend'o pagal aktyvią kalbą
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        const data = await api<ServiceDTO[]>(`/services?lang=${lang}`);
        if (!cancelled) {
          setServices(data);
        }
      } catch (e: any) {
        console.error("Failed to load services:", e);
        if (!cancelled) {
          setErr(uiText.error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [lang]); // kai keičiasi kalba – iš naujo fetchinam

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Helperis ikonų URL'ui (palaiko ir pilną, ir santykinį kelią)
  function getIconSrc(iconUrl: string) {
    if (!iconUrl) return "";

    // jei jau pilnas URL – paliekam
    if (iconUrl.startsWith("http://") || iconUrl.startsWith("https://")) {
      return iconUrl;
    }

    let normalized = iconUrl.trim();
    if (!normalized.startsWith("/")) {
      normalized = "/" + normalized;
    }

    return `${API}${normalized}`;
  }

  // --- Reusable sub‐components ---
  const ServiceCard = ({
    title,
    subtitle,
    iconUrl,
    onClick,
  }: {
    title: string;
    subtitle: string;
    iconUrl: string;
    onClick: () => void;
  }) => (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white rounded-lg shadow-md hover:shadow-xl transition transform hover:scale-105 duration-200 p-6 flex flex-col justify-between"
    >
      <div className="flex items-center px-[2vw]">
        <div className="mr-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getIconSrc(iconUrl)}
            alt={title}
            style={ICON_STYLE}
          />
        </div>
        <div>
          <h3 className="text-[2.5vh] font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 text-[2vh]">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  const ServiceModal = ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => {
    if (!isOpen) return null;
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto shadow-xl"
        >
          <button onClick={onClose} className="float-right text-2xl leading-none">
            &times;
          </button>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    );
  };

  // --- Render ---
  return (
    <section>
      {loading && (
        <p className="text-sm text-gray-500 mb-4">{uiText.loading}</p>
      )}
      {err && (
        <p className="text-sm text-red-600 mb-4">{err}</p>
      )}

      <div className="flex flex-wrap gap-4">
        {services.map((service) => (
          <div key={service.id} className="w-1/2">
            <ServiceCard
              title={service.title}
              subtitle={service.subtitle}
              iconUrl={service.iconUrl}
              onClick={() => setSelectedServiceId(service.id)}
            />
          </div>
        ))}
      </div>

      <ServiceModal
        isOpen={!!selectedServiceId}
        onClose={() => setSelectedServiceId(null)}
      >
        {selectedService && (
          <>
            <h2 className="text-neutral-900 text-xl font-bold mb-4">
              {selectedService.title}
            </h2>
            {/* details iš DB – rodome su line break'ais */}
            <p className="mb-4 whitespace-pre-line text-gray-700">
              {selectedService.details}
            </p>
          </>
        )}
      </ServiceModal>
    </section>
  );
};
