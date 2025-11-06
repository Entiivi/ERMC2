"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ProjectDTO } from "@/app/lib/api";
import PatirtisModalExpanded from "@/app/components/patirtisModalExpanded";
import type { FullProjectDTO } from "@/app/lib/api";
import { useLanguage } from "@/app/kalbos/LanguageContext"; // 👈 PRIDĖTA

type ProjectsApiResp = ProjectDTO[] | { projects: ProjectDTO[]; tags?: string[] };

export default function PatirtisPlaciauPage() {
  const { lang } = useLanguage(); // 👈 AKTYVI KALBA (LT / EN)

  const [data, setData] = useState<ProjectDTO[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [active, setActive] = useState<string>("Visi");

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  // Modal state
  const [selected, setSelected] = useState<FullProjectDTO | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailErr, setDetailErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // 👇 siunčiam kalbą į backendą
        const res = await api<ProjectsApiResp>(`/projects?lang=${lang}`);
        if (cancelled) return;

        const projects = Array.isArray(res) ? res : res.projects ?? [];
        const uniqueTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort();

        setAllTags(["Visi", ...uniqueTags]); // filtrų label'iai – kol kas LT, jei reikės, išversim atskirai
        setData(projects);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? (lang === "EN" ? "Failed to load data" : "Nepavyko įkelti duomenų"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lang]); // 👈 kai pasikeičia kalba, persikrauna projektų sąrašas

  const filtered = useMemo(() => {
    if (active === "Visi") return data;
    return data.filter((p) => p.tags.includes(active));
  }, [data, active]);

  // helper to normalize any stored URL to /photos/... path
  function toPhotoPath(url?: string): string {
    if (!url) return "/photos/placeholder.jpg";
    try {
      const u = new URL(url);
      return u.pathname.startsWith("/photos/")
        ? u.pathname
        : `/photos/${u.pathname.replace(/^\/+/, "")}`;
    } catch {
      return url.startsWith("/photos/")
        ? url
        : `/photos/${url.replace(/^\/+/, "")}`;
    }
  }

  // Open modal and load project-specific photos from backend
  const handleOpen = async (projectId: string) => {
    setLoadingDetail(true);
    setDetailErr(null);
    setImgIdx(0);

    try {
      const full = await api<FullProjectDTO>(`/projects/${projectId}`);

      const photoPaths = (full.photos ?? []).map(p => toPhotoPath(p.url));
      const coverPath = toPhotoPath(full.cover);
      const gallery = photoPaths.length ? photoPaths : [coverPath];

      setSelected(full);
      setGallery(gallery);
    } catch (e: any) {
      setDetailErr(e?.message ?? (lang === "EN" ? "Failed to load project" : "Nepavyko įkelti projekto"));
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setSelected(null);
    setGallery([]);
    setImgIdx(0);
    setDetailErr(null);
  };

  const nextImg = () =>
    setImgIdx((i) => (gallery.length ? (i + 1) % gallery.length : 0));
  const prevImg = () =>
    setImgIdx((i) => (gallery.length ? (i - 1 + gallery.length) % gallery.length : 0));

  return (
    <main
      className="min-h-screen overflow-y-auto max-w-7xl mx-auto px-[4vw] py-[6vh]"
      style={{ overflowX: "hidden" }}
    >
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-10vw mb-6 pl-3vw">
          {allTags.map((t) => (
            <a
              key={t}
              onClick={() => setActive(t)}
              className={`text-[2vh] hover:scale-105 hover:text-[#14b8a6] transition duration-200 py-3 cursor-pointer select-none text-gray-800 shadow-md ${
                active === t ? "bg-black text-white" : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
              style={{ padding: "1vw", paddingBottom: "3vh" }}
              aria-pressed={active === t}
            >
              {t} {/* jei reikės, vėliau galima daryti, pvz.: t === "Visi" ? (lang==="EN"?"All":"Visi") : t */}
            </a>
          ))}
        </div>
      )}

      {loading && (
        <p className="text-sm text-gray-500">
          {lang === "EN" ? "Loading…" : "Kraunama…"}
        </p>
      )}
      {err && <p className="text-sm text-red-600">{err}</p>}

      <div
        className="
          grid 
          grid-cols-2 sm:grid-cols-2
          gap-[4vw]
          justify-items-center
          w-full
          px-[2vw]
          overflow-visible
          h-auto
          pr-2
        "
      >
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer w-full max-w-[600px]"
            onClick={() => handleOpen(p.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleOpen(p.id); }}
            aria-label={
              lang === "EN"
                ? `Open project: ${p.title}`
                : `Atidaryti projektą: ${p.title}`
            }
          >
            <div className="p-4">
              <time className="text-[1.5vh] text-gray-500 mb-2 block">
                {new Date(p.date).toLocaleDateString(
                  lang === "EN" ? "en-GB" : "lt-LT",
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </time>
              <h3
                className="text-[2vh] text-gray-800 leading-snug text-left whitespace-normal break-words sm:text-lg"
                style={{ fontWeight: "normal" }}
              >
                {p.title}
              </h3>

              {!!p.tech?.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tech.slice(0, 4).map((t, i) => (
                    <span
                      key={`${p.id}-tech-${i}`}
                      className="text-[5px] px-2 py-0.5 rounded bg-gray-100 border"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <PatirtisModalExpanded
        selected={selected}
        setImgIdx={setImgIdx}
        onClose={closeModal}
        onPrev={prevImg}
        onNext={nextImg}
      />
    </main>
  );
}
