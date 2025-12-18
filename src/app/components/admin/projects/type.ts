// components/admin/projects/types.ts

export type Lang = "LT" | "EN";

export type Project = {
  id: string;

  lang?: Lang; // jei backend kartais grąžina lang (nebūtina)

  title: string;
  date: string; // ISO string iš backend

  cover: string;
  logoUrl?: string | null;

  tech: any; // Prisma Json - dažnai būna array arba object

  tags: string[]; // supaprastintai: tik pavadinimai

  excerpt?: string | null;
  link?: string | null;
  client?: string | null;

  // ✅ location (iš Prisma)
  address?: string | null;
  lat?: number | null;
  lng?: number | null;

  // (optional) jei backend grąžina timestamps
  createdAt?: string;
  updatedAt?: string;
};
