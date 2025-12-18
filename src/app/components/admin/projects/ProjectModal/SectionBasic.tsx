"use client";

import { ProjectForm, ProjectFormProps } from "../ProjectForm";
import { Project } from "../type";

export function SectionBasic({
  currentProject,
  onClose,
  formProps,
}: {
  currentProject: Project | null;
  onClose: () => void;
  formProps: ProjectFormProps;
}) {
  const dateFormatted =
    currentProject?.date && !Number.isNaN(new Date(currentProject.date).getTime())
      ? new Date(currentProject.date).toLocaleDateString("lt-LT")
      : null;

  return (
    <div className="space-y-4">
      {currentProject && (
        <div className="bg-white rounded-2xl p-4">
          <div className="text-sm font-semibold text-black mb-2">Santrauka</div>

          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
            {currentProject.cover ? (
              <div className="aspect-video overflow-hidden rounded-xl bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentProject.cover}
                  alt={currentProject.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-black/60">Klientas</div>
              <div className="text-sm text-black">{currentProject.client ?? "–"}</div>

              <div className="text-xs uppercase tracking-wide text-black/60 mt-3">Data</div>
              <div className="text-sm text-black">{dateFormatted ?? "–"}</div>

              <div className="text-xs uppercase tracking-wide text-black/60 mt-3">Žymos</div>
              <div className="flex flex-wrap gap-1">
                {currentProject.tags?.length
                  ? currentProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-wide bg-black/10 text-black rounded-full px-2 py-[2px]"
                      >
                        {tag}
                      </span>
                    ))
                  : "–"}
              </div>

              {currentProject.excerpt ? (
                <>
                  <div className="text-xs uppercase tracking-wide text-black/60 mt-3">
                    Trumpas aprašymas
                  </div>
                  <div className="text-sm text-black/80">{currentProject.excerpt}</div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <ProjectForm {...formProps} onCancelEdit={onClose} />
    </div>
  );
}
