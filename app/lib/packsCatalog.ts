export type PackCatalogItem = {
  mediaType: "anime" | "series" | "movie";
  mediaSlug: string;
  title: string;
  character: string;
  language: string;
  season: string;
  pack: string;
  file: string;
  href: string;
  updatedAt: number;
  updatedAtText: string;
  isMonetized: boolean;
};

export const packsCatalog: PackCatalogItem[] = [];
