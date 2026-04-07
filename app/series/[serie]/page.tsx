import fs from "fs";
import path from "path";
import Link from "next/link";
import SerieFilterClient from "./components/SerieFilterClient";
import { downloadLinks } from "@/app/lib/downloadLinks";

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
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

function getAllPacks(serie: string): PackItem[] {
  const seriesPath = path.join(
    process.cwd(),
    "public",
    "downloads",
    "series",
    serie
  );

  const items: PackItem[] = [];

  if (!fs.existsSync(seriesPath)) return items;

  const characters = fs
    .readdirSync(seriesPath, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  for (const character of characters) {
    const characterPath = path.join(seriesPath, character);
    if (!fs.existsSync(characterPath)) continue;

    const languages = fs
      .readdirSync(characterPath, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    for (const language of languages) {
      const languagePath = path.join(characterPath, language);
      if (!fs.existsSync(languagePath)) continue;

      const seasons = fs
        .readdirSync(languagePath, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => item.name);

      for (const season of seasons) {
        const seasonPath = path.join(languagePath, season);
        if (!fs.existsSync(seasonPath)) continue;

        const packs = fs
          .readdirSync(seasonPath, { withFileTypes: true })
          .filter((item) => item.isDirectory())
          .map((item) => item.name);

        for (const pack of packs) {
          const slug = `${character}-${language}-${season}-${pack}`;
          const packPath = path.join(seasonPath, pack);

          if (!fs.existsSync(packPath)) continue;

          const stat = fs.statSync(packPath);

          if (normalizedDownloadLinks[normalizeSlug(slug)]) {
            items.push({
              title: `${formatLabel(character)} - ${formatLabel(pack)}`,
              character,
              language,
              season,
              pack,
              file: pack,
              href: `/downloads/series/${serie}/${character}/${language}/${season}/${pack}`,
              updatedAt: stat.mtimeMs,
              updatedAtText: formatDate(stat.mtimeMs),
              isMonetized: true,
            });
          } else {
            const files = fs
              .readdirSync(packPath, { withFileTypes: true })
              .filter((item) => item.isFile())
              .map((item) => item.name)
              .filter((file) => {
                const lower = file.toLowerCase();
                return lower.endsWith(".mp4") || lower.endsWith(".zip");
              });

            for (const file of files) {
              const filePath = path.join(packPath, file);
              const fileStat = fs.statSync(filePath);

              items.push({
                title: `${formatLabel(character)} - ${formatLabel(pack)}`,
                character,
                language,
                season,
                pack,
                file,
                href: `/downloads/series/${serie}/${character}/${language}/${season}/${pack}/${file}`,
                updatedAt: fileStat.mtimeMs,
                updatedAtText: formatDate(fileStat.mtimeMs),
                isMonetized: false,
              });
            }
          }
        }
      }
    }
  }

  return items.sort((a, b) => {
    const characterCompare = a.character.localeCompare(b.character);
    if (characterCompare !== 0) return characterCompare;
    return b.updatedAt - a.updatedAt;
  });
}

export default async function SeriePage({
  params,
  searchParams,
}: {
  params: Promise<{ serie: string }>;
  searchParams: Promise<{ language?: string; quality?: string }>;
}) {
  const { serie } = await params;
  const { language, quality } = await searchParams;

  const activeLang = language ? normalizeLang(language) : null;
  const activeQuality =
    quality === "4k" || quality === "1080p" ? quality : null;

  let packs = getAllPacks(serie);

  if (activeLang) {
    packs = packs.filter(
      (item) => item.language.toLowerCase() === activeLang
    );
  }

  if (activeQuality === "4k") {
    packs = packs.filter((item) => {
      const value = `${item.pack} ${item.file} ${item.season}`.toLowerCase();
      return (
        value.includes("4k") ||
        value.includes("2160p") ||
        value.includes("uhd")
      );
    });
  }

  if (activeQuality === "1080p") {
    packs = packs.filter((item) => {
      const value = `${item.pack} ${item.file} ${item.season}`.toLowerCase();
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
              href={`/series/${serie}`}
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

      <SerieFilterClient serie={serie} packs={packs} />
    </>
  );
}