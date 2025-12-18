// components/admin/projects/useProjectForm.ts

"use client";

import { useCallback, useState, FormEvent } from "react";
import type { Lang, Project } from "./type";

type UseProjectFormArgs = {
  apiBase: string;
  lang: Lang;
  refresh: (lang: Lang) => Promise<void>;
  setError: (msg: string | null) => void;
};

export function useProjectForm({
  apiBase,
  lang,
  refresh,
  setError,
}: UseProjectFormArgs) {
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

  const resetForm = useCallback(() => {
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
  }, []);

  const startEdit = useCallback((p: Project) => {
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
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
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
              body.error ||
                `Nepavyko sukurti projekto (status ${res.status})`
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
              body.error ||
                `Nepavyko atnaujinti projekto (status ${res.status})`
            );
          }
        }

        resetForm();
        await refresh(lang);
      } catch (err: any) {
        console.error("Save error:", err);
        setError(err?.message ?? "Nepavyko išsaugoti projekto");
      }
    },
    [
      apiBase,
      client,
      cover,
      dateStr,
      editingId,
      excerpt,
      lang,
      link,
      logoUrl,
      resetForm,
      setError,
      tagsText,
      techText,
      title,
      refresh,
    ]
  );

  return {
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

    resetForm,
    startEdit,
    handleSubmit,
  };
}
