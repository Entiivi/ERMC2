"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectsPanel } from "../components/admin/projects/ProjectsPanel";
import { ParaiskosPanel } from "../components/admin/ParaiskosPanel";
import { ServicesPanel } from "../components/admin/ServicesPanel";
import { PartnersPanel } from "../components/admin/PartnersPanel";
import { CareersPanel } from "../components/admin/KarjeraPanel";
import { ContactsPanel } from "../components/admin/KontaktaiPanel";
import { AboutPanel } from "../components/admin/AboutPanel";
import { WorkersPanel } from "../components/admin/WorkersPanel";
import { MaterialsPanel } from "../components/admin/MaterialsPanel";
import React from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type TabId =
  | "projects"
  | "materials"
  | "workers"
  | "paraiskos"
  | "services"
  | "partners"
  | "careers"
  | "contacts"
  | "about";


const menuItems: { id: TabId; label: string }[] = [
  { id: "projects", label: "Projektai" },
  { id: "materials", label: "Medžiagos" },
  { id: "workers", label: "Darbuotojai" },
  { id: "paraiskos", label: "Paraiškos" },
  { id: "about", label: "Apie mus" },
  { id: "services", label: "Paslaugos" },
  { id: "partners", label: "Partneriai" },
  { id: "careers", label: "Karjera" },
  { id: "contacts", label: "Kontaktai" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("projects");

  const renderActivePanel = () => {
    switch (activeTab) {
      case "projects":
        return <ProjectsPanel apiBase={API} />;
      case "materials":
        return <MaterialsPanel apiBase={API} />;
      case "workers":
        return <WorkersPanel apiBase={API} />;
      case "paraiskos":
        return <ParaiskosPanel apiBase={API} />;
      case "services":
        return <ServicesPanel apiBase={API} />;
      case "partners":
        return <PartnersPanel apiBase={API} />;
      case "careers":
        return <CareersPanel apiBase={API} />;
      case "contacts":
        return <ContactsPanel apiBase={API} />;
      case "about":
        return <AboutPanel apiBase={API} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen px-[2vw] py-8 overflow-y-hidden">
      <h1 className="text-3xl font-bold mb-[3vh] tracking-tight">ADMIN</h1>

      <div className="max-w-6xl mx-auto flex">
        {/* LEFT SIDEBAR */}
        <aside className="w-56 flex-shrink-0">
          <div className="flex flex-col gap-3">
            {menuItems.map((item, index) => {
              const isActive = activeTab === item.id;

              return (
                <React.Fragment key={item.id}>
                  <a
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      backgroundColor: "transparent",
                      borderColor: isActive ? "#000000" : "rgba(0,0,0,0.6)",
                      color: isActive ? "#14b8a6" :"#171717",
                      paddingRight: "2vw"
                    }}
                    className={[
                      "w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors duration-200 cursor-pointer select-none",
                      isActive
                        ? "rounded-l-3xl rounded-r-none border-r-0"
                        : "rounded-3xl",
                    ].join(" ")}
                  >
                    {item.label}
                  </a>
                  <div className="h-[1vh]"></div>

                  {/* GAP after 4th button */}
                  {index === 3 && <div className="h-[4vh]" />}
                </React.Fragment>
              );
            })}
          </div>
        </aside>

        {/* RIGHT CONTENT BUBBLE */}
        <section className="flex-1 pl-0 mt-[-2.5vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{
                backgroundColor: "transparent",
                color: "#171717",
              }}
              className="
                h-[90vh]
                rounded-3xl rounded-l-none
                -ml-px
                px-6
                overflow-auto
              "
            >
              {renderActivePanel()}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
