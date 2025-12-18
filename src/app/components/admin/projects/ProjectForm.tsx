// components/admin/projects/ProjectForm.tsx

import type { FormEvent } from "react";

export type ProjectFormProps = {
  editingId: string | null;

  title: string;
  setTitle: (v: string) => void;

  client: string;
  setClient: (v: string) => void;

  dateStr: string;
  setDateStr: (v: string) => void;

  cover: string;
  setCover: (v: string) => void;

  logoUrl: string;
  setLogoUrl: (v: string) => void;

  excerpt: string;
  setExcerpt: (v: string) => void;

  link: string;
  setLink: (v: string) => void;

  techText: string;
  setTechText: (v: string) => void;

  tagsText: string;
  setTagsText: (v: string) => void;

  onSubmit: (e: FormEvent) => void;
  onCancelEdit: () => void;
};

export function ProjectForm({
  editingId,
  title,
  setTitle,
  client,
  setClient,
  dateStr,
  setDateStr,
  cover,
  setCover,
  logoUrl,
  setLogoUrl,
  excerpt,
  setExcerpt,
  link,
  setLink,
  techText,
  setTechText,
  tagsText,
  setTagsText,
  onSubmit,
  onCancelEdit,
}: ProjectFormProps) {
  return (
    <section className="rounded-2xl p-4">
      <h3 className="text-lg font-semibold mb-2">
        {editingId == null ? "Pridėti naują projektą" : "Redaguoti projektą"}
      </h3>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm">
            Pavadinimas *
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md px-2 py-1 text-black text-sm"
              required
            />
          </label>

          <label className="text-sm">
            Klientas
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="mt-1 w-full px-2 py-1 text-black text-sm"
            />
          </label>

          <label className="text-sm">
            Data
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="mt-1 w-full px-2 py-1 text-black text-sm"
            />
          </label>

          <label className="text-sm">
            Cover kelias *
            <input
              type="text"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              className="mt-1 w-full px-2 py-1 text-black text-sm"
              placeholder="/uploads/photos/projektas1.jpg"
              required
            />
          </label>

          <label className="text-sm">
            Logo URL (pasirinktinai)
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="mt-1 w-full px-2 py-1 text-black text-sm"
              placeholder="/logos/client.svg"
            />
          </label>

          <label className="text-sm">
            Projekto nuoroda (pvz. atskiras puslapis)
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="mt-1 w-full px-2 py-1 text-black text-sm"
              placeholder="https://..."
            />
          </label>

          <label className="text-sm md:col-span-2">
            Trumpas aprašymas (excerpt)
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="mt-1 w-full px-2 py-1 text-black text-sm h-24 resize-vertical"
            />
          </label>

          <label className="text-sm md:col-span-2">
            Technologijos (tech), atskirtos kableliais
            <input
              type="text"
              value={techText}
              onChange={(e) => setTechText(e.target.value)}
              className="mt-1 w-full px-2 py-1 text-black text-sm"
              placeholder="pvz. React, Node.js, Prisma"
            />
          </label>

          <label className="text-sm md:col-span-2">
            Žymos (tags), atskirtos kableliais
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="mt-1 w-full rounded-md px-2 py-1 text-black text-sm"
              placeholder="pvz. Elektromontavimas, Pramonė, Projektavimas"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="submit"
            className="px-4 py-1.5 rounded-full bg-black/80 hover:bg-black text-sm"
          >
            {editingId == null ? "Sukurti projektą" : "Išsaugoti pakeitimus"}
          </button>

          {editingId != null && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-1.5 rounded-full bg-white/80 hover:bg-white text-sm text-black"
            >
              Atšaukti redagavimą
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
