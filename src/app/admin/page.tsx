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

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type TabId =
  | "projects"
  | "paraiskos"
  | "services"
  | "partners"
  | "careers"
  | "contacts"
  | "about";

const menuItems: { id: TabId; label: string }[] = [
  { id: "projects", label: "Projektai" },
  { id: "paraiskos", label: "CV paraiškos" },
  { id: "services", label: "Paslaugos" },
  { id: "partners", label: "Partneriai" },
  { id: "careers", label: "Karjera" },
  { id: "contacts", label: "Kontaktai" },
  { id: "about", label: "Apie mus" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("projects");

  const renderActivePanel = () => {
    switch (activeTab) {
      case "projects":
        return <ProjectsPanel apiBase={API} />;
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
    <main className="min-h-screen px-[2vw] py-8">
      <h1 className="text-3xl font-bold mb-6 tracking-tight">ADMIN PANELĖ</h1>

      <div className="max-w-6xl mx-auto flex">
        {/* LEFT SIDEBAR */}
        <aside className="w-56 flex-shrink-0">
          <div className="flex flex-col gap-3">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    backgroundColor: isActive ? "#22c55e" : "#ef4444",
                    borderColor: isActive ? "#000000" : "rgba(0,0,0,0.6)",
                    color: "#ffffff",
                  }}
                  className={[
                    "w-full text-left px-4 py-2.5 text-sm font-semibold border transition-colors duration-200",
                    isActive
                      ? "rounded-l-3xl rounded-r-none border-r-0"
                      : "rounded-3xl",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT CONTENT BUBBLE */}
        <section className="flex-1 pl-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{
                backgroundColor: "#22c55e", // same as active button
                borderColor: "#000000",
                color: "#ffffff",
              }}
              className="
                h-[70vh]
                border
                rounded-3xl rounded-l-none
                -ml-px
                px-6 py-5
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
