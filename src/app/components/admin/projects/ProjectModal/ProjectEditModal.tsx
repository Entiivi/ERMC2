"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Project } from "../type";
import { ProjectFormProps } from "../ProjectForm";
import { ModalTabs, TabKey } from "./ModalTabs";

import { SectionBasic } from "./SectionBasic";
import { SectionMaterials } from "./SectionMaterials";
import { SectionLocation } from "./SectionLocation";
import { SectionElectricity } from "./SectionElectricity";
import { SectionWorkers } from "./SectionWorkers";
// vėliau: SectionElectricity, SectionWorkers

type ProjectEditModalProps = {
  apiBase: string;
  isOpen: boolean;
  onClose: () => void;
  currentProject: Project | null;
} & ProjectFormProps;

export function ProjectEditModal({
  apiBase,
  isOpen,
  onClose,
  currentProject,
  ...formProps
}: ProjectEditModalProps) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<TabKey>("basic");

  useEffect(() => setMounted(true), []);

  // kai atidaromas kitas projektas – grąžinam į „Pagrindinis“
  useEffect(() => {
    if (isOpen) setTab("basic");
  }, [currentProject?.id, isOpen]);

  if (!mounted || !isOpen) return null;

  const projektasId = formProps.editingId;
  const needsId = !projektasId;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483646,
      }}
    >
      {/* BACKDROP */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#0B0E14",
          opacity: 0.65,
        }}
      />

      {/* MODAL */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          absolute
          left-1/2 top-1/2
          -translate-x-1/2 -translate-y-1/2

          w-[90vw]
          max-w-[80vw]
          min-w-[40vw]

          h-[82vh]
          min-h-[520px]

          bg-[#f6f6f6]
          rounded-[20px]
          shadow-2xl

          flex flex-col
          overflow-y-auto overflow-x-hidden
          px-[2vw]
          py-[1vh]
        "
        style={{ zIndex: 2147483647 }}
      >
        {/* HEADER */}
        <div className="shrink-0 px-6 py-4 justify">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm hover:bg-black/5"
          >
            ✕
          </button>
        </div>

        {/* NAV TABS */}
        <ModalTabs
          active={tab}
          onChange={setTab}
          disabled={{
            materials: needsId,
            location: needsId,
            electricity: needsId,
            workers: needsId,
          }}
        />

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5">
          {tab === "basic" && (
            <SectionBasic
              currentProject={currentProject}
              onClose={onClose}
              formProps={formProps}
            />
          )}

          {tab === "materials" && (
            projektasId ? (
              <SectionMaterials
                apiBase={apiBase}
                projektasId={projektasId}
              />
            ) : (
              <div className="text-sm text-black/60">
                Pirma sukurk projektą, tada galėsi priskirti medžiagas.
              </div>
            )
          )}

          {tab === "location" && (
            projektasId ? (
              <SectionLocation
                apiBase={apiBase}
                projektasId={projektasId}
              />
            ) : (
              <div className="text-sm text-black/60">
                Pirma sukurk projektą, tada galėsi nustatyti vietą.
              </div>
            )
          )}

          {tab === "electricity" ? (
            projektasId ? (
              <SectionElectricity
                apiBase={apiBase}
                projektasId={projektasId}
              />
            ) : (
              <div className="text-sm text-black/70">
                Pirma sukurk projektą, tada galėsi tvarkyti elektros informaciją.
              </div>
            )
          ) : null}

          {tab === "workers" ? (
            projektasId ? (
              <SectionWorkers apiBase={apiBase} projektasId={projektasId} />
            ) : (
              <div className="text-sm text-black/70">
                Pirma sukurk projektą, tada galėsi priskirti darbuotojus.
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
