// components/admin/projects/ProjectsHeader.tsx

import { Lang } from "../projects/type";

type ProjectsHeaderProps = {
  lang: Lang;
  onLangChange: (lang: Lang) => void;

  search: string;
  onSearchChange: (value: string) => void;

  tagFilter: string | "ALL";
  onTagFilterChange: (value: string | "ALL") => void;

  availableTags: string[];
  onResetForm: () => void;
};

export function ProjectsHeader({
  lang,
  onLangChange,
  search,
  onSearchChange,
  tagFilter,
  onTagFilterChange,
  availableTags,
  onResetForm,
}: ProjectsHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Projektų administravimas</h2>
        <p className="text-sm opacity-90">
          Čia gali pridėti, redaguoti ir tvarkyti ERMC projektus.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Paieška pagal pavadinimą, klientą ar aprašymą…"
          className="rounded-full px-3 py-1.5 text-sm text-black min-w-[200px]"
        />

        <select
          value={tagFilter}
          onChange={(e) =>
            onTagFilterChange(
              e.target.value === "ALL" ? "ALL" : e.target.value
            )
          }
          className="rounded-full px-3 py-1.5 text-sm text-black"
        >
          <option value="ALL">Visos žymos</option>
          {availableTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={lang}
          onChange={(e) => {
            const newLang = e.target.value === "EN" ? "EN" : "LT";
            onLangChange(newLang);
            onResetForm();
          }}
          className="rounded-full px-3 py-1.5 text-sm text-black"
        >
          <option value="LT">LT</option>
          <option value="EN">EN</option>
        </select>
      </div>
    </header>
  );
}
