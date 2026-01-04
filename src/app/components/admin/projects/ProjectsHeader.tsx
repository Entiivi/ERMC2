// components/admin/projects/ProjectsHeader.tsx

import { useState } from "react";
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

const style =
  "[all:unset] box-border flex items-center px-3 py-1.5 text-sm font-inherit text-inherit bg-white/90 rounded-md cursor-text";


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

  const [selectOpen, setSelectOpen] = useState(false);
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold">Projektai</h2>
      </div>

      <div className="flex flex-wrap items-center gap-[1vw]">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Paieška..."
          className={style}
          style={{ minWidth: 100 }}
        />

        <div className="hover:scale-105 hover:text-[#14b8a6] transition-transform duration-200 flex items-center gap-2 cursor-pointer select-none">
          <select
            value={tagFilter}
            onFocus={() => setSelectOpen(true)}
            onBlur={() => setSelectOpen(false)}
            onChange={(e) => {
              onTagFilterChange(e.target.value === "ALL" ? "ALL" : e.target.value);
              setSelectOpen(false);
            }}
            className={[
              style,
            ].join(" ")}
          >
            <option value="ALL">Visos žymos</option>
            {availableTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <span
            className={`block scale-150 transition-transform duration-200 pointer-events-none ${selectOpen ? "rotate-180" : ""
              }`}
          >
            ▾
          </span>
        </div>

        <select
          value={lang}
          onChange={(e) => {
            const newLang = e.target.value === "EN" ? "EN" : "LT";
            onLangChange(newLang);
            onResetForm();
          }}
          className={"py-1.5 text-sm text-black"}
        >
          <option value="LT">LT</option>
          <option value="EN">EN</option>
        </select>
      </div>
    </header>
  );
}
