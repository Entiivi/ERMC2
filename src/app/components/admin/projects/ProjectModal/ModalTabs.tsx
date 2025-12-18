"use client";

export type TabKey = "basic" | "materials" | "location" | "electricity" | "workers";

export function ModalTabs({
  active,
  onChange,
  disabled,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
  disabled?: Partial<Record<TabKey, boolean>>;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "basic", label: "Pagrindinis" },
    { key: "materials", label: "Medžiagos" },
    { key: "location", label: "Vieta" },
    { key: "electricity", label: "Elektra" },
    { key: "workers", label: "Darbuotojai" },
  ];

  return (
    <div className="px-5 pt-3 pb-3 ">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const isActive = active === t.key;
          const isDisabled = !!disabled?.[t.key];

          return (
            <button
              key={t.key}
              type="button"
              onClick={() => !isDisabled && onChange(t.key)}
              disabled={isDisabled}
              className={[
                "px-3 py-1.5 rounded-full text-sm border transition",
                isActive
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black/20 hover:bg-black/5",
                isDisabled ? "opacity-50 cursor-not-allowed hover:bg-white" : "",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
