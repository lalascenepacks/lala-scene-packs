const fs = require("fs");
const path = require("path");

const R2_PUBLIC_BASE_URL =
  "https://pub-5719d1a2ca594294addba288a9734eb8.r2.dev";

function normalizeSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US");
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "—";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);

  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)}${sizes[i]}`;
}

function formatLabel(value) {
  return value.replaceAll("-", " ");
}

function encodePathParts(parts) {
  return parts.map((part) => encodeURIComponent(part)).join("/");
}

function loadDownloadLinks() {
  const filePath = path.join(process.cwd(), "app", "lib", "downloadLinks.ts");
  const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";

  const matches = [...content.matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)];
  const result = {};

  for (const match of matches) {
    result[normalizeSlug(match[1])] = match[2];
  }

  return result;
}

function getFolders(folderPath) {
  if (!fs.existsSync(folderPath)) return [];

  return fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);
}

function getFiles(folderPath) {
  if (!fs.existsSync(folderPath)) return [];

  return fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => {
      const lower = fileName.toLowerCase();
      return lower.endsWith(".mp4") || lower.endsWith(".zip");
    });
}

function getQuality(fileName) {
  const match = fileName.match(/(4k|2160p|1080p|720p)/i);
  return match ? match[1].toUpperCase() : "Unknown";
}

function getEpisode(fileName) {
  const match =
    fileName.match(/(\d{2}x\d{2})/i) ||
    fileName.match(/(\d{1,2}x\d{1,2})/i) ||
    fileName.match(/s(\d{1,2})e(\d{1,2})/i);

  if (!match) return "";

  if (match[0].toLowerCase().startsWith("s")) {
    return `${match[1].padStart(2, "0")}x${match[2].padStart(2, "0")}`;
  }

  return match[1];
}

function getPart(fileName) {
  const match =
    fileName.match(/part[\s._-]?(\d+)/i) ||
    fileName.match(/pt[\s._-]?(\d+)/i) ||
    fileName.match(/\bp(\d+)\b/i);

  if (!match) return "";

  return `Part ${match[1]}`;
}

function getPackMeta(packPath) {
  const files = getFiles(packPath);

  let totalSize = 0;
  let quality = "Unknown";
  let episode = "";
  let part = "";

  for (const file of files) {
    const filePath = path.join(packPath, file);
    const fileStat = fs.statSync(filePath);

    totalSize += fileStat.size;

    if (quality === "Unknown") quality = getQuality(file);
    if (!episode) episode = getEpisode(file);
    if (!part) part = getPart(file);
  }

  return {
    files,
    firstFile: files[0] || "",
    fileSizeBytes: totalSize,
    fileSizeText: formatBytes(totalSize),
    quality,
    episode,
    part,
  };
}

function buildTitle(character, pack, episode, part) {
  const extra = [episode, part].filter(Boolean).join(" ");

  return `${formatLabel(character)} - ${
    extra ? `${extra} ` : ""
  }${formatLabel(pack)}`;
}

const downloadLinks = loadDownloadLinks();
const items = [];

function addAnimePacks() {
  const root = path.join("X:\\meus-downloads-site\\downloads", "animes");
  const animes = getFolders(root);

  for (const anime of animes) {
    const animePath = path.join(root, anime);
    const characters = getFolders(animePath);

    for (const character of characters) {
      const characterPath = path.join(animePath, character);
      const languages = getFolders(characterPath);

      for (const language of languages) {
        const languagePath = path.join(characterPath, language);
        const seasons = getFolders(languagePath);

        for (const season of seasons) {
          const seasonPath = path.join(languagePath, season);
          const packs = getFolders(seasonPath);

          for (const pack of packs) {
            const slug = normalizeSlug(
              `${character}-${language}-${season}-${pack}`
            );
            const packPath = path.join(seasonPath, pack);

            if (!fs.existsSync(packPath)) continue;

            const stat = fs.statSync(packPath);
            const meta = getPackMeta(packPath);
            const isMonetized = !!downloadLinks[slug];

            items.push({
              mediaType: "anime",
              mediaSlug: anime,
              title: buildTitle(character, pack, meta.episode, meta.part),
              character,
              language,
              season,
              pack,
              file: isMonetized ? pack : meta.firstFile || pack,
              href: isMonetized
                ? downloadLinks[slug]
                : `${R2_PUBLIC_BASE_URL}/${encodePathParts([
                    character,
                    language,
                    season,
                    pack,
                    meta.firstFile || "",
                  ])}`,
              fileSizeBytes: meta.fileSizeBytes,
              fileSizeText: meta.fileSizeText,
              quality: meta.quality,
              episode: meta.episode,
              part: meta.part,
              updatedAt: stat.mtimeMs,
              updatedAtText: formatDate(stat.mtimeMs),
              isMonetized,
            });
          }
        }
      }
    }
  }
}

function addSeriesPacks() {
  const root = path.join("X:\\meus-downloads-site\\downloads", "series");
  const series = getFolders(root);

  for (const serie of series) {
    const seriePath = path.join(root, serie);
    const characters = getFolders(seriePath);

    for (const character of characters) {
      const characterPath = path.join(seriePath, character);
      const languages = getFolders(characterPath);

      for (const language of languages) {
        const languagePath = path.join(characterPath, language);
        const seasons = getFolders(languagePath);

        for (const season of seasons) {
          const seasonPath = path.join(languagePath, season);
          const packs = getFolders(seasonPath);

          for (const pack of packs) {
            const slug = normalizeSlug(
              `${character}-${language}-${season}-${pack}`
            );
            const packPath = path.join(seasonPath, pack);

            if (!fs.existsSync(packPath)) continue;

            const stat = fs.statSync(packPath);
            const meta = getPackMeta(packPath);
            const isMonetized = !!downloadLinks[slug];

            items.push({
              mediaType: "series",
              mediaSlug: serie,
              title: buildTitle(character, pack, meta.episode, meta.part),
              character,
              language,
              season,
              pack,
              file: isMonetized ? pack : meta.firstFile || pack,
              href: isMonetized
                ? downloadLinks[slug]
                : `${R2_PUBLIC_BASE_URL}/${encodePathParts([
                    character,
                    language,
                    season,
                    pack,
                    meta.firstFile || "",
                  ])}`,
              fileSizeBytes: meta.fileSizeBytes,
              fileSizeText: meta.fileSizeText,
              quality: meta.quality,
              episode: meta.episode,
              part: meta.part,
              updatedAt: stat.mtimeMs,
              updatedAtText: formatDate(stat.mtimeMs),
              isMonetized,
            });
          }
        }
      }
    }
  }
}

function addMoviePacks() {
  const root = path.join("X:\\meus-downloads-site\\downloads", "movies");
  const movies = getFolders(root);

  for (const movie of movies) {
    const moviePath = path.join(root, movie);
    const characters = getFolders(moviePath);

    for (const character of characters) {
      const characterPath = path.join(moviePath, character);
      const languages = getFolders(characterPath);

      for (const language of languages) {
        const languagePath = path.join(characterPath, language);
        const packs = getFolders(languagePath);

        for (const pack of packs) {
          const slug = normalizeSlug(`${character}-${language}--${pack}`);
          const packPath = path.join(languagePath, pack);

          if (!fs.existsSync(packPath)) continue;

          const stat = fs.statSync(packPath);
          const meta = getPackMeta(packPath);
          const isMonetized = !!downloadLinks[slug];

          items.push({
            mediaType: "movie",
            mediaSlug: movie,
            title: buildTitle(character, pack, meta.episode, meta.part),
            character,
            language,
            season: "",
            pack,
            file: isMonetized ? pack : meta.firstFile || pack,
            href: isMonetized
              ? downloadLinks[slug]
              : `${R2_PUBLIC_BASE_URL}/${encodePathParts([
                  character,
                  language,
                  pack,
                  meta.firstFile || "",
                ])}`,
            fileSizeBytes: meta.fileSizeBytes,
            fileSizeText: meta.fileSizeText,
            quality: meta.quality,
            episode: meta.episode,
            part: meta.part,
            updatedAt: stat.mtimeMs,
            updatedAtText: formatDate(stat.mtimeMs),
            isMonetized,
          });
        }
      }
    }
  }
}

addAnimePacks();
addSeriesPacks();
addMoviePacks();

const fileContent = `export type PackCatalogItem = {
  mediaType: "anime" | "series" | "movie";
  mediaSlug: string;
  title: string;
  character: string;
  language: string;
  season: string;
  pack: string;
  file: string;
  href: string;
  fileSizeBytes: number;
  fileSizeText: string;
  quality?: string;
  episode?: string;
  part?: string;
  updatedAt: number;
  updatedAtText: string;
  isMonetized: boolean;
};

export const packsCatalog: PackCatalogItem[] = ${JSON.stringify(items, null, 2)};
`;

fs.writeFileSync(
  path.join(process.cwd(), "app", "lib", "packsCatalog.ts"),
  fileContent,
  "utf8"
);

console.log("Packs catalog generated!");