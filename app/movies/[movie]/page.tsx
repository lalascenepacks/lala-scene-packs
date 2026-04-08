import fs from "fs";
import path from "path";
import Link from "next/link";
import MovieFilterClient from "./components/MovieFilterClient";
import { downloadLinks } from "@/app/lib/downloadLinks";
import { packsCatalog } from "@/app/lib/packsCatalog";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const normalizedDownloadLinks = Object.fromEntries(
  Object.entries(downloadLinks).map(([key, value]) => [
    normalizeSlug(key),
    value,
  ])
);

export type PackItem = {
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

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US");
}

function formatLabel(value: string) {
  return value.replaceAll("-", " ");
}

function normalizeLang(value: string) {
  const lower = value.toLowerCase();
  if (lower === "br" || lower === "jp" || lower === "us") return lower;
  return null;
}

function getAllPacks(movie: string): PackItem[] {
  return packsCatalog
    .filter(
      (item) => item.mediaType === "movie" && item.mediaSlug === movie
    )
    .map((item) => ({
      title: item.title,
      character: item.character,
      language: item.language,
      season: item.season,
      pack: item.pack,
      file: item.file,
      href: item.href,
      updatedAt: item.updatedAt,
      updatedAtText: item.updatedAtText,
      isMonetized: item.isMonetized,
    }))
    .sort((a, b) => {
      const characterCompare = a.character.localeCompare(b.character);
      if (characterCompare !== 0) return characterCompare;
      return b.updatedAt - a.updatedAt;
    });
}

export default async function MoviePage({
  params,
  searchParams,
}: {
  params: Promise<{ movie: string }>;
  searchParams: Promise<{ language?: string; quality?: string }>;
}) {
  const { movie } = await params;
  const { language, quality } = await searchParams;

  const activeLang = language ? normalizeLang(language) : null;
  const activeQuality =
    quality === "4k" || quality === "1080p" ? quality : null;

  let packs = getAllPacks(movie);

  if (activeLang) {
    packs = packs.filter(
      (item) => item.language.toLowerCase() === activeLang
    );
  }

  if (activeQuality === "4k") {
    packs = packs.filter((item) => {
      const value = `${item.pack} ${item.file}`.toLowerCase();
      return (
        value.includes("4k") ||
        value.includes("2160p") ||
        value.includes("uhd")
      );
    });
  }

  if (activeQuality === "1080p") {
    packs = packs.filter((item) => {
      const value = `${item.pack} ${item.file}`.toLowerCase();
      return value.includes("1080p") || value.includes("full hd");
    });
  }

  return (
    <>
      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "22px 24px 0",
        }}
      >
        {(activeLang || activeQuality) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            {activeLang && (
              <div
                style={{
                  display: "inline-flex",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#cbd5e1",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                Filtered by language: {activeLang.toUpperCase()}
              </div>
            )}

            {activeQuality && (
              <div
                style={{
                  display: "inline-flex",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#cbd5e1",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                Filtered by quality: {activeQuality.toUpperCase()}
              </div>
            )}

            <Link
              href={`/movies/${movie}`}
              style={{
                color: "#93c5fd",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              Clear filter
            </Link>
          </div>
        )}
      </main>

      <MovieFilterClient movie={movie} packs={packs} />
    </>
  );
}