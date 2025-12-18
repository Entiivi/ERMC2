// components/admin/projects/useProjectsData.ts

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Lang, Project } from "./type";

type UseProjectsDataArgs = {
  apiBase: string;
  lang: Lang;
};

export function useProjectsData({ apiBase, lang }: UseProjectsDataArgs) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filtrai
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | "ALL">("ALL");

  const fetchProjects = useCallback(
    async (currentLang: Lang) => {
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
    },
    [apiBase]
  );

  useEffect(() => {
    fetchProjects(lang);
  }, [lang, fetchProjects]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Ar tikrai ištrinti šį projektą?")) return;

      try {
        setError(null);

        const res = await fetch(`${apiBase}/projektai/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error ||
              `Nepavyko ištrinti projekto (status ${res.status})`
          );
        }

        await fetchProjects(lang);
      } catch (err: any) {
        console.error("Delete error:", err);
        setError(err?.message ?? "Nepavyko ištrinti projekto");
      }
    },
    [apiBase, fetchProjects, lang]
  );

  const filteredProjects = useMemo(
    () =>
      projects
        .filter((p) =>
          tagFilter === "ALL" ? true : p.tags?.includes(tagFilter)
        )
        .filter((p) => {
          const q = search.toLowerCase();
          if (!q) return true;
          return (
            p.title.toLowerCase().includes(q) ||
            (p.client ?? "").toLowerCase().includes(q) ||
            (p.excerpt ?? "").toLowerCase().includes(q)
          );
        }),
    [projects, tagFilter, search]
  );

  return {
    // raw
    projects,
    availableTags,
    loading,
    error,
    setError,

    // filtrai
    search,
    setSearch,
    tagFilter,
    setTagFilter,

    // derived
    filteredProjects,

    // actions
    fetchProjects,
    handleDelete,
  };
}
