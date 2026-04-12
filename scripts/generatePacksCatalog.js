const fs = require("fs");
const path = require("path");
const R2_PUBLIC_BASE_URL = "https://pub-5719d1a2ca594294addba288a9734eb8.r2.dev";

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

function formatLabel(value) {
  return value.replaceAll("-", " ");
}

function encodePathParts(parts) {
  return parts.map((part) => encodeURIComponent(part)).join("/");
}

function loadDownloadLinks() {
  const filePath = path.join(process.cwd(), "app", "lib", "downloadLinks.ts");
  const content = fs.readFileSync(filePath, "utf8");

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

const downloadLinks = loadDownloadLinks();
const items = [];

function addAnimePacks() {
  const root = path.join(process.cwd(), "public", "downloads", "animes");
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
            const slug = normalizeSlug(`${character}-${language}-${season}-${pack}`);
            const packPath = path.join(seasonPath, pack);

            if (!fs.existsSync(packPath)) continue;

            const stat = fs.statSync(packPath);

            if (downloadLinks[slug]) {
              items.push({
                mediaType: "anime",
                mediaSlug: anime,
                title: `${formatLabel(character)} - ${formatLabel(pack)}`,
                character,
                language,
                season,
                pack,
                file: pack,
                href: downloadLinks[slug],
                updatedAt: stat.mtimeMs,
                updatedAtText: formatDate(stat.mtimeMs),
                isMonetized: true,
              });
            } else {
              const files = fs
                .readdirSync(packPath, { withFileTypes: true })
                .filter((entry) => entry.isFile())
                .map((entry) => entry.name)
                .filter((fileName) => {
                  const lower = fileName.toLowerCase();
                  return lower.endsWith(".mp4") || lower.endsWith(".zip");
                });

              for (const file of files) {
                const filePath = path.join(packPath, file);
                const fileStat = fs.statSync(filePath);

                items.push({
  mediaType: "anime",
  mediaSlug: anime,
  title: `${formatLabel(character)} - ${formatLabel(pack)}`,
  character,
  language,
  season,
  pack,
  file,
  href: `${R2_PUBLIC_BASE_URL}/${encodePathParts([
    character,
    language,
    season,
    pack,
    file,
  ])}`,
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
  }
}

function addSeriesPacks() {
  const root = path.join(process.cwd(), "public", "downloads", "series");
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
            const slug = normalizeSlug(`${character}-${language}-${season}-${pack}`);
            const packPath = path.join(seasonPath, pack);

            if (!fs.existsSync(packPath)) continue;

            const stat = fs.statSync(packPath);

            if (downloadLinks[slug]) {
              items.push({
                mediaType: "series",
                mediaSlug: serie,
                title: `${formatLabel(character)} - ${formatLabel(pack)}`,
                character,
                language,
                season,
                pack,
                file: pack,
                href: downloadLinks[slug],
                updatedAt: stat.mtimeMs,
                updatedAtText: formatDate(stat.mtimeMs),
                isMonetized: true,
              });
            } else {
              const files = fs
                .readdirSync(packPath, { withFileTypes: true })
                .filter((entry) => entry.isFile())
                .map((entry) => entry.name)
                .filter((fileName) => {
                  const lower = fileName.toLowerCase();
                  return lower.endsWith(".mp4") || lower.endsWith(".zip");
                });

              for (const file of files) {
                const filePath = path.join(packPath, file);
                const fileStat = fs.statSync(filePath);

                items.push({
  mediaType: "series",
  mediaSlug: serie,
  title: `${formatLabel(character)} - ${formatLabel(pack)}`,
  character,
  language,
  season,
  pack,
  file,
  href: `${R2_PUBLIC_BASE_URL}/${encodePathParts([
    character,
    language,
    season,
    pack,
    file,
  ])}`,
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
  }
}

function addMoviePacks() {
  const root = path.join(process.cwd(), "public", "downloads", "movies");
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

          if (downloadLinks[slug]) {
            items.push({
              mediaType: "movie",
              mediaSlug: movie,
              title: `${formatLabel(character)} - ${formatLabel(pack)}`,
              character,
              language,
              season: "",
              pack,
              file: pack,
              href: downloadLinks[slug],
              updatedAt: stat.mtimeMs,
              updatedAtText: formatDate(stat.mtimeMs),
              isMonetized: true,
            });
          } else {
            const files = fs
              .readdirSync(packPath, { withFileTypes: true })
              .filter((entry) => entry.isFile())
              .map((entry) => entry.name)
              .filter((fileName) => {
                const lower = fileName.toLowerCase();
                return lower.endsWith(".mp4") || lower.endsWith(".zip");
              });

            for (const file of files) {
              const filePath = path.join(packPath, file);
              const fileStat = fs.statSync(filePath);

              items.push({
  mediaType: "movie",
  mediaSlug: movie,
  title: `${formatLabel(character)} - ${formatLabel(pack)}`,
  character,
  language,
  season: "",
  pack,
  file,
  href: `${R2_PUBLIC_BASE_URL}/${encodePathParts([
    character,
    language,
    pack,
    file,
  ])}`,
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