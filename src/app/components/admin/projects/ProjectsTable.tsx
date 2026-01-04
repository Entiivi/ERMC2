// components/admin/projects/ProjectsTable.tsx

import { Project } from "../projects/type";

type ProjectsTableProps = {
  loading: boolean;
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
};

function formatDate(iso: string | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("lt-LT");
}

const actionBtn =
    "px-6 py-3 cursor-pointer select-none transition-transform duration-200 hover:scale-105 hover:text-[#14b8a6]";

const dangerBtnSm =
    "text-xs px-3 py-1 cursor-pointer select-none transition-transform duration-200 hover:scale-105 hover:text-[#ef4444]";

export function ProjectsTable({
  loading,
  projects,
  onEdit,
  onDelete,
}: ProjectsTableProps) {
  return (
    <div className="rounded-2xl overflow-hidden ">
      <table className="w-full text-sm">
        <thead className="bg-black/20">
          <tr className="text-left">
            <th className="px-3 py-2 border-b border-white/40 w-[32%]">
              Projektas
            </th>
            <th className="px-3 py-2 border-b border-white/40 w-[18%]">
              Klientas
            </th>
            <th className="px-3 py-2 border-b border-white/40 w-[18%]">
              Data
            </th>
            <th className="px-3 py-2 border-b border-white/40 w-[18%]">
              Žymos
            </th>
            <th className="px-3 py-2 border-b border-white/40">
              Veiksmai
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="px-3 py-4 text-center">
                Kraunama...
              </td>
            </tr>
          ) : projects.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-4 text-center">
                Projektų nėra. Pabandyk pakeisti filtrus arba pridėti naują
                projektą žemiau.
              </td>
            </tr>
          ) : (
            projects.map((p) => (
              <tr key={p.id} className="odd:bg.white/5 even:bg-white/0">
                <td className="px-3 py-2 align-top">
                  <div className="font-semibold mb-1">{p.title}</div>
                  {p.excerpt && (
                    <div className="text-xs opacity-90 line-clamp-3">
                      {p.excerpt}
                    </div>
                  )}
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] underline opacity-90"
                    >
                      Projekto nuoroda
                    </a>
                  )}
                </td>
                <td className="px-3 py-2 border-b border-white/20 align-top">
                  {p.client || (
                    <span className="opacity-60 text-xs">–</span>
                  )}
                </td>
                <td className="px-3 py-2 border-b border-white/20 align-top">
                  {formatDate(p.date) || (
                    <span className="opacity-60 text-xs">–</span>
                  )}
                </td>
                <td className="px-3 py-2 border-b border-white/20 align-top">
                  {p.tags && p.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] uppercase tracking-wide bg-black/30 rounded-full px-2 py-[2px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="opacity-60 text-xs">–</span>
                  )}
                </td>
                <td className="px-3 py-2 border-white/20 align-top">
                  <div className="flex flex-wrap gap-[1vw]">
                    <a
                      type="button"
                      onClick={() => onEdit(p)}
                      className={actionBtn}
                    >
                      Redaguoti
                    </a>
                    <a
                      type="button"
                      onClick={() => onDelete(p.id)}
                      className={dangerBtnSm}
                    >
                      Trinti
                    </a>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
