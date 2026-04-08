const fs = require("fs");
const path = require("path");

function normalizeSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getFolders(folderPath) {
  if (!fs.existsSync(folderPath)) return [];

  return fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);
}

function countAvailableDownloads(folderName, itemName, downloadLinks) {
  const itemPath = path.join(
    process.cwd(),
    "public",
    "downloads",
    folderName,
    itemName
  );

  if (!fs.existsSync(itemPath)) return 0;

  let total = 0;

  const characters = fs
    .readdirSync(itemPath, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  for (const character of characters) {
    const characterPath = path.join(itemPath, character);
    if (!fs.existsSync(characterPath)) continue;

    const languages = fs
      .readdirSync(characterPath, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    for (const language of languages) {
      const languagePath = path.join(characterPath, language);
      if (!fs.existsSync(languagePath)) continue;

      if (folderName === "movies") {
        const packs = fs
          .readdirSync(languagePath, { withFileTypes: true })
          .filter((item) => item.isDirectory())
          .map((item) => item.name);

        for (const pack of packs) {
          const slug = normalizeSlug(`${character}-${language}--${pack}`);
          const packPath = path.join(languagePath, pack);

          if (downloadLinks[slug]) {
            total += 1;
          } else {
            const files = fs
              .readdirSync(packPath, { withFileTypes: true })
              .filter((item) => item.isFile())
              .map((item) => item.name)
              .filter((file) => {
                const lower = file.toLowerCase();
                return lower.endsWith(".mp4") || lower.endsWith(".zip");
              });

            total += files.length;
          }
        }
      } else {
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
            const slug = normalizeSlug(`${character}-${language}-${season}-${pack}`);
            const packPath = path.join(seasonPath, pack);

            if (downloadLinks[slug]) {
              total += 1;
            } else {
              const files = fs
                .readdirSync(packPath, { withFileTypes: true })
                .filter((item) => item.isFile())
                .map((item) => item.name)
                .filter((file) => {
                  const lower = file.toLowerCase();
                  return lower.endsWith(".mp4") || lower.endsWith(".zip");
                });

              total += files.length;
            }
          }
        }
      }
    }
  }

  return total;
}

function countNestedScenePacks(folderPath, hasSeason) {
  if (!fs.existsSync(folderPath)) return 0;

  let total = 0;

  const characters = fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  for (const character of characters) {
    const characterPath = path.join(folderPath, character);
    if (!fs.existsSync(characterPath)) continue;

    const languages = fs
      .readdirSync(characterPath, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    for (const language of languages) {
      const languagePath = path.join(characterPath, language);
      if (!fs.existsSync(languagePath)) continue;

      if (hasSeason) {
        const seasons = fs
          .readdirSync(languagePath, { withFileTypes: true })
          .filter((item) => item.isDirectory())
          .map((item) => item.name);

        for (const season of seasons) {
          const seasonPath = path.join(languagePath, season);
          if (!fs.existsSync(seasonPath)) continue;

          const packs = fs
            .readdirSync(seasonPath, { withFileTypes: true })
            .filter((item) => item.isDirectory());

          total += packs.length;
        }
      } else {
        const packs = fs
          .readdirSync(languagePath, { withFileTypes: true })
          .filter((item) => item.isDirectory());

        total += packs.length;
      }
    }
  }

  return total;
}

function getLatestUpdatedAt(folderPath) {
  if (!fs.existsSync(folderPath)) return 0;

  let latest = 0;

  function walk(currentPath) {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);

      if (item.isDirectory()) {
        walk(fullPath);
      } else if (item.isFile()) {
        const stat = fs.statSync(fullPath);
        if (stat.mtimeMs > latest) latest = stat.mtimeMs;
      }
    }
  }

  walk(folderPath);
  return latest;
}

function getFlags(folderPath) {
  const flags = {
    is4k: false,
    is1080p: false,
    isBR: false,
    isJP: false,
    isUS: false,
    isBestScenes: false,
    isMelhoresCenas: false,
    isAllScenes: false,
    isTodasAsCenas: false,
  };

  if (!fs.existsSync(folderPath)) return flags;

  function walk(currentPath) {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);
      const value = item.name.toLowerCase();

      if (
        value.includes("4k") ||
        value.includes("2160p") ||
        value.includes("uhd")
      ) {
        flags.is4k = true;
      }

      if (value.includes("1080p") || value.includes("full hd")) {
        flags.is1080p = true;
      }

      if (
        value === "br" ||
        value.includes("-br") ||
        value.includes("_br") ||
        value.includes("pt-br") ||
        value.includes("brazil")
      ) {
        flags.isBR = true;
      }

      if (
        value === "jp" ||
        value.includes("-jp") ||
        value.includes("_jp") ||
        value.includes("japan") ||
        value.includes("japanese")
      ) {
        flags.isJP = true;
      }

      if (
        value === "us" ||
        value.includes("-us") ||
        value.includes("_us") ||
        value.includes("english") ||
        value.includes("en-us")
      ) {
        flags.isUS = true;
      }

      if (value.includes("best-scenes")) flags.isBestScenes = true;
      if (value.includes("melhores-cenas")) flags.isMelhoresCenas = true;
      if (value.includes("all-scenes")) flags.isAllScenes = true;
      if (value.includes("todas-as-cenas")) flags.isTodasAsCenas = true;

      if (item.isDirectory()) {
        walk(fullPath);
      }
    }
  }

  walk(folderPath);
  return flags;
}

function buildItems(type, folderName, coverFolder, names, downloadLinks) {
  return names.map((item) => {
    const itemFolderPath = path.join(
      process.cwd(),
      "public",
      "downloads",
      folderName,
      item
    );

    const hasSeason = type !== "movie";

    return {
      name: item,
      href: `/${folderName}/${item}`,
      cover: `/covers/${coverFolder}/${normalizeSlug(item)}.jpeg`,
      mp4Count: countAvailableDownloads(folderName, item, downloadLinks),
      scenePacksCount: countNestedScenePacks(itemFolderPath, hasSeason),
      type,
      latestUpdatedAt: getLatestUpdatedAt(itemFolderPath),
      flags: getFlags(itemFolderPath),
    };
  });
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

const downloadLinks = loadDownloadLinks();

const animes = getFolders(path.join(process.cwd(), "public", "downloads", "animes"));
const series = getFolders(path.join(process.cwd(), "public", "downloads", "series"));
const movies = getFolders(path.join(process.cwd(), "public", "downloads", "movies"));

const catalog = [
  ...buildItems("anime", "animes", "animes", animes, downloadLinks),
  ...buildItems("series", "series", "series", series, downloadLinks),
  ...buildItems("movie", "movies", "movies", movies, downloadLinks),
];

const fileContent = `export const catalog = ${JSON.stringify(catalog, null, 2)} as const;\n`;

fs.writeFileSync(
  path.join(process.cwd(), "app", "lib", "catalog.ts"),
  fileContent,
  "utf8"
);

console.log("Catalog generated!");