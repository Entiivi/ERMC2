// components/admin/projects/ProjectsPanel.tsx

"use client";

import { useEffect, useState, FormEvent } from "react";
import { Lang, Project } from "./type";
import { ProjectsHeader } from "./ProjectsHeader";
import { ProjectsTable } from "./ProjectsTable";
import { ProjectForm } from "./ProjectForm";
import { ProjectEditModal } from "./ProjectModal/ProjectEditModal";
import { ProjektaiPreviewPanel } from "../../admin/prerview/ProjektaiPreviewPanel"

type ProjectsPanelProps = {
  apiBase: string;
};

export function ProjectsPanel({ apiBase }: ProjectsPanelProps) {
  const [lang, setLang] = useState<Lang>("LT");
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filtrai
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | "ALL">("ALL");

  // forma
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [dateStr, setDateStr] = useState(""); // YYYY-MM-DD
  const [cover, setCover] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [link, setLink] = useState("");
  const [techText, setTechText] = useState("");
  const [tagsText, setTagsText] = useState("");

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setClient("");
    setDateStr("");
    setCover("");
    setLogoUrl("");
    setExcerpt("");
    setLink("");
    setTechText("");
    setTagsText("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    setCurrentProject(null);
  };

  const fetchProjects = async (currentLang: Lang) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${apiBase}/projektai?lang=${currentLang}`);
      if (!res.ok) {
        throw new Error(`Serverio klaida: ${res.status}`);
      }

      const json = await res.json();
      const data = (json.projects ?? []) as Project[];
      const tags = (json.tags ?? []) as string[];

      setProjects(data);
      setAvailableTags(tags);
    } catch (err: any) {
      console.error("Nepavyko gauti projektų:", err);
      setError(err?.message ?? "Nepavyko gauti projektų");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(lang);
  }, [lang]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Pavadinimas (title) privalomas");
      return;
    }
    if (!cover.trim()) {
      alert("Viršelio kelias (cover) privalomas");
      return;
    }

    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const tech = techText
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: title.trim(),
      client: client.trim() || undefined,
      date: dateStr || undefined,
      cover: cover.trim(),
      logoUrl: logoUrl.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      link: link.trim() || undefined,
      tech,
      tags,
      lang,
    };

    try {
      setError(null);

      if (editingId == null) {
        // CREATE
        const res = await fetch(`${apiBase}/projektai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko sukurti projekto (status ${res.status})`
          );
        }
      } else {
        // UPDATE
        const res = await fetch(`${apiBase}/projektai/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Nepavyko atnaujinti projekto (status ${res.status})`
          );
        }
      }

      closeModal();
      await fetchProjects(lang);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err?.message ?? "Nepavyko išsaugoti projekto");
    }
  };

  const handleEditClick = (p: Project) => {
    setCurrentProject(p);
    setEditingId(p.id);
    setTitle(p.title ?? "");
    setClient(p.client ?? "");
    setCover(p.cover ?? "");
    setLogoUrl(p.logoUrl ?? "");
    setExcerpt(p.excerpt ?? "");
    setLink(p.link ?? "");
    setTechText(
      Array.isArray(p.tech)
        ? p.tech
          .map((x) => (typeof x === "string" ? x : JSON.stringify(x)))
          .join(", ")
        : ""
    );
    setTagsText(p.tags?.join(", ") ?? "");

    if (p.date) {
      try {
        const d = new Date(p.date);
        if (!Number.isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          setDateStr(`${year}-${month}-${day}`);
        } else {
          setDateStr("");
        }
      } catch {
        setDateStr("");
      }
    } else {
      setDateStr("");
    }

    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ar tikrai ištrinti šį projektą?")) return;

    try {
      setError(null);

      const res = await fetch(`${apiBase}/projektai/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || `Nepavyko ištrinti projekto (status ${res.status})`
        );
      }

      await fetchProjects(lang);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err?.message ?? "Nepavyko ištrinti projekto");
    }
  };

  const handleCreateClick = () => {
    resetForm();
    setCurrentProject(null);
    setIsModalOpen(true);
  };

  // Filtruojam client-side
  const filteredProjects = projects
    .filter((p) => (tagFilter === "ALL" ? true : p.tags?.includes(tagFilter)))
    .filter((p) => {
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.client ?? "").toLowerCase().includes(q) ||
        (p.excerpt ?? "").toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6">
      <ProjectsHeader
        lang={lang}
        onLangChange={setLang}
        search={search}
        onSearchChange={setSearch}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
        availableTags={availableTags}
        onResetForm={resetForm}
      />

      {error && (
        <div className="border border-red-500 bg-red-700/60 text-white text-sm rounded-xl px-3 py-2">
          Klaida: {error}
        </div>
      )}

      <ProjectsTable
        loading={loading}
        projects={filteredProjects}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />

      {/* Mygtukas naujam projektui */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCreateClick}
          className="px-4 py-1.5 rounded-full bg-black/80 hover:bg-black text-sm"
        >
          Pridėti naują projektą
        </button>
      </div>

      {/* Fullscreen modal su pilna info + forma */}
      <ProjectEditModal
        apiBase={apiBase}
        isOpen={isModalOpen}
        onClose={closeModal}
        currentProject={currentProject}
        editingId={editingId}
        title={title}
        setTitle={setTitle}
        client={client}
        setClient={setClient}
        dateStr={dateStr}
        setDateStr={setDateStr}
        cover={cover}
        setCover={setCover}
        logoUrl={logoUrl}
        setLogoUrl={setLogoUrl}
        excerpt={excerpt}
        setExcerpt={setExcerpt}
        link={link}
        setLink={setLink}
        techText={techText}
        setTechText={setTechText}
        tagsText={tagsText}
        setTagsText={setTagsText}
        onSubmit={handleSubmit}
        onCancelEdit={closeModal}
      />
      <ProjektaiPreviewPanel lang={lang} />
    </div>
    
  );
}
