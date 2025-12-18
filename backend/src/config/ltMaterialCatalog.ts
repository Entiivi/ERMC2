export type PriceUnit = "EUR/t" | "EUR/kg" | "EUR/m3" | "EUR/m2" | "EUR/m" | "EUR/vnt";

export type IndexGroup =
    | "CEMENT"
    | "CONCRETE"
    | "STEEL"
    | "TIMBER"
    | "INSULATION"
    | "BITUMEN"
    | "CABLES"
    | "PIPES"
    | "FASTENERS"
    | "FINISHING"
    | "ELECTRICAL_PARTS"
    | "MEP_PARTS"
    | "OTHER";

export type LTMateralCatalogItem = {
    key: string;            // stable id (used in API)
    name: string;           // display
    spec?: string;          // optional (CEM II/A-LL 42.5R, B500B, etc.)
    sector: "Construction" | "Electrical" | "MEP" | "Infrastructure" | "Metalworks";
    category: string;       // expandable list grouping
    unit: PriceUnit;

    // reference price (you fill once)
    base: {
        price: number;        // your reference price
        period: string;       // "YYYY-MM" e.g. "2025-01"
        sourceNote: string;   // e.g. "CPO LT median", "Supplier websites median"
    };

    // how we adjust over time
    indexGroup: IndexGroup;

    // optional helpers for UI / search
    tags?: string[];
};

export const LT_MATERIAL_CATALOG: LTMateralCatalogItem[] = [
    // --- Cement & binders ---
    {
        key: "cement_cem2_42_5r",
        name: "Cementas",
        spec: "CEM II/A-LL 42.5R (bulk)",
        sector: "Construction",
        category: "Cementas ir rišikliai",
        unit: "EUR/t",
        base: { price: 95, period: "2025-01", sourceNote: "ranka irasytas reference (LT market)" },
        indexGroup: "CEMENT",
        tags: ["cement", "bulk"],
    },
    {
        key: "cement_cem1_42_5r",
        name: "Cementas",
        spec: "CEM I 42.5R (bulk)",
        sector: "Construction",
        category: "Cementas ir rišikliai",
        unit: "EUR/t",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "CEMENT",
        tags: ["cement", "bulk"],
    },

    // --- Concrete ---
    {
        key: "concrete_c25_30",
        name: "Betonas",
        spec: "C25/30 (ready-mix)",
        sector: "Construction",
        category: "Betonas",
        unit: "EUR/m3",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "CONCRETE",
        tags: ["concrete"],
    },
    {
        key: "concrete_c30_37",
        name: "Betonas",
        spec: "C30/37 (ready-mix)",
        sector: "Construction",
        category: "Betonas",
        unit: "EUR/m3",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "CONCRETE",
        tags: ["concrete"],
    },

    // --- Steel / rebar / profiles ---
    {
        key: "rebar_b500b_12mm",
        name: "Armatūra",
        spec: "B500B Ø12",
        sector: "Metalworks",
        category: "Plienas ir armatūra",
        unit: "EUR/kg",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "STEEL",
        tags: ["rebar", "steel"],
    },
    {
        key: "mesh_a142",
        name: "Armatūrinis tinklas",
        spec: "A142 (typ.)",
        sector: "Metalworks",
        category: "Plienas ir armatūra",
        unit: "EUR/m2",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "STEEL",
        tags: ["mesh", "steel"],
    },
    {
        key: "steel_profile_ipe",
        name: "Plieno profilis",
        spec: "IPE (typ.)",
        sector: "Metalworks",
        category: "Plienas ir profiliai",
        unit: "EUR/kg",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "STEEL",
        tags: ["profile", "steel"],
    },
    {
        key: "sheet_metal_galv",
        name: "Cinkuota skarda",
        spec: "0.5–1.0 mm",
        sector: "Metalworks",
        category: "Lakštinis metalas",
        unit: "EUR/m2",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "STEEL",
        tags: ["sheet", "galv"],
    },

    // --- Timber ---
    {
        key: "timber_c24",
        name: "Mediena",
        spec: "C24 konstrukcinė",
        sector: "Construction",
        category: "Mediena",
        unit: "EUR/m3",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "TIMBER",
        tags: ["timber"],
    },
    {
        key: "osb_12mm",
        name: "OSB plokštė",
        spec: "12 mm",
        sector: "Construction",
        category: "Mediena",
        unit: "EUR/m2",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "TIMBER",
        tags: ["osb"],
    },

    // --- Insulation ---
    {
        key: "eps_70_100mm",
        name: "Šilumos izoliacija",
        spec: "EPS70 100 mm",
        sector: "Construction",
        category: "Izoliacija",
        unit: "EUR/m2",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "INSULATION",
        tags: ["eps"],
    },
    {
        key: "mineral_wool_100mm",
        name: "Mineralinė vata",
        spec: "100 mm (fasadui/stogui)",
        sector: "Construction",
        category: "Izoliacija",
        unit: "EUR/m2",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "INSULATION",
        tags: ["wool"],
    },

    // --- Roads / bitumen (if you need infra) ---
    {
        key: "bitumen_50_70",
        name: "Bitumas",
        spec: "50/70",
        sector: "Infrastructure",
        category: "Kelių medžiagos",
        unit: "EUR/t",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "BITUMEN",
        tags: ["bitumen"],
    },

    // --- Electrical cables ---
    {
        key: "cable_nyy_5x10",
        name: "Elektros kabelis",
        spec: "NYY-J 5x10 mm²",
        sector: "Electrical",
        category: "Kabeliai",
        unit: "EUR/m",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "CABLES",
        tags: ["cable", "low-voltage"],
    },
    {
        key: "cable_nyy_3x2_5",
        name: "Elektros kabelis",
        spec: "NYY-J 3x2.5 mm²",
        sector: "Electrical",
        category: "Kabeliai",
        unit: "EUR/m",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "CABLES",
        tags: ["cable", "low-voltage"],
    },

    // --- Electrical parts ---
    {
        key: "switchboard_24m",
        name: "Skydelis",
        spec: "24 mod. (typ.)",
        sector: "Electrical",
        category: "Skydai ir automatika",
        unit: "EUR/vnt",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "ELECTRICAL_PARTS",
        tags: ["switchboard"],
    },
    {
        key: "mcb_16a",
        name: "Automatinis jungiklis",
        spec: "MCB 1P 16A",
        sector: "Electrical",
        category: "Skydai ir automatika",
        unit: "EUR/vnt",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "ELECTRICAL_PARTS",
        tags: ["mcb"],
    },

    // --- Pipes / MEP ---
    {
        key: "ppr_pipe_32",
        name: "Vamzdis",
        spec: "PPR Ø32",
        sector: "MEP",
        category: "Vamzdžiai ir jungtys",
        unit: "EUR/m",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "PIPES",
        tags: ["pipe"],
    },
    {
        key: "pvc_sewer_110",
        name: "Nuotekų vamzdis",
        spec: "PVC Ø110",
        sector: "MEP",
        category: "Vamzdžiai ir jungtys",
        unit: "EUR/m",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "PIPES",
        tags: ["sewer"],
    },

    // --- Fasteners ---
    {
        key: "anchor_m10",
        name: "Inkaras",
        spec: "M10",
        sector: "Construction",
        category: "Tvirtinimo detalės",
        unit: "EUR/vnt",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "FASTENERS",
        tags: ["anchor"],
    },
    {
        key: "screws_wood",
        name: "Sraigtai",
        spec: "medienai (typ.)",
        sector: "Construction",
        category: "Tvirtinimo detalės",
        unit: "EUR/vnt",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "FASTENERS",
        tags: ["screws"],
    },

    // --- Finishing ---
    {
        key: "gypsum_board_12_5",
        name: "Gipso kartono plokštė",
        spec: "12.5 mm",
        sector: "Construction",
        category: "Apdaila",
        unit: "EUR/m2",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "FINISHING",
        tags: ["drywall"],
    },
    {
        key: "plaster_mix",
        name: "Tinkas / mišinys",
        spec: "vidaus (typ.)",
        sector: "Construction",
        category: "Apdaila",
        unit: "EUR/kg",
        base: { price: 0, period: "2025-01", sourceNote: "" },
        indexGroup: "FINISHING",
        tags: ["plaster"],
    },
];
