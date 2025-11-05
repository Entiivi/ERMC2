// ./src/app/lib/api.ts

// Pagrindinis API adresas (env arba localhost)
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Universalus API fetch helperis
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store", ...init });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API ${path} failed: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    console.error("Fetch failed:", { url: `${BASE}${path}`, err });
    throw err;
  }
}

/* =========================
   DTOs (shared app-wide)
   ========================= */
export type PartnerisDTO = {
  id: string;
  name: string;
  imageSrc?: string;      // path from DB (optional now)
  image?: string;         // base64 from API
  imageAlt?: string | null;
  lang?: 'LT' | 'EN';
  createdAt?: string;
  updatedAt?: string;
};

export type PhotoDTO = {
  id: string;
  url: string;
  caption?: string | null;
};

export type ProjectDTO = {
  id: string;
  title: string;
  date: string;      // ISO string
  cover: string;
  tech: string[];    // adjust if you need a stricter type
  tags: string[];
  excerpt?: string;
  link?: string;
};

export type FullProjectDTO = ProjectDTO & {
  images?: string[];
  photos?: PhotoDTO[];
  description?: string | null;
};

export type PaslaugaDTO = {
  id: string;
  title: string;
  description: string;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type KarjeraDTO = {
  id: string;
  title: string;
  location?: string | null;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

export type KontaktasDTO = {
  id: string;
  label: string;
  value: string;
  copyable: boolean;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function getJob(id: string) {
  const res = await fetch(`${BASE}/darbas/${id}`, {
    next: { revalidate: 60 }, // or: cache: "no-store"
  });
  if (!res.ok) throw new Error(`Failed to load job ${id}`);
  return res.json() as Promise<{
    id: string;
    title: string;
    description?: string | null;
    location?: string | null;
    type?: string | null;
    salary?: string | null;
    postedAt: string;
    responsibilities: string[];
  }>;
}

export type DarbasDTO = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  type?: string | null;
  salary?: string | null;
  postedAt: string;
  updatedAt: string;
};

/* =========================
   Response types + helpers
   ========================= */
export type PartneriaiApiResp = { partners: PartnerisDTO[] };
export type ProjektaiApiResp  = { projects: ProjectDTO[]; tags?: string[] };
export type ProjectsApiResp   = ProjectDTO[] | { projects: ProjectDTO[]; tags?: string[] }; // union used in UI
export type ContactsApiResp   = KontaktasDTO[] | { contacts: KontaktasDTO[] };

/* ----- Fetch helpers ----- */
export async function getPartners() {
  return api<PartneriaiApiResp>("/partners");
}

export async function getProjects() {
  return api<ProjektaiApiResp>("/projects");
}

export async function getProject(id: string) {
  return api<FullProjectDTO>(`/projects/${id}`);
}

export async function getServices() {
  return api<{ services: PaslaugaDTO[] }>("/services");
}

export async function getCareers() {
  return api<{ careers: KarjeraDTO[] }>("/careers");
}

export async function getContacts() {
  return api<ContactsApiResp>("/contacts");
}

export async function getJobs(): Promise<DarbasDTO[]> {
  return api<DarbasDTO[]>("/jobs");
}

