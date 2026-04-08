const fs = require("fs");
const path = require("path");

function normalizeSlug(value) {
  return value
    .trim()
    .toLowerCase()
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

function countFiles(folderPath) {
  if (!fs.existsSync(folderPath)) return 0;

  let total = 0;

  function walk(currentPath) {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);

      if (item.isDirectory()) {
        walk(fullPath);
      } else {
        total++;
      }
    }
  }

  walk(folderPath);
  return total;
}

function buildItems(type, folderName) {
  const basePath = path.join(
    process.cwd(),
    "public",
    "downloads",
    folderName
  );

  const folders = getFolders(basePath);

  return folders.map((item) => {
    const itemPath = path.join(basePath, item);

    return {
      title: item,
      name: normalizeSlug(item),
      href: `/${folderName}/${normalizeSlug(item)}`,
      cover: `/covers/${folderName}/${normalizeSlug(item)}.jpeg`,
      mp4Count: countFiles(itemPath),
      scenePacksCount: countFiles(itemPath),
      type,
      latestUpdatedAt: Date.now(),
      flags: {
        is4k: true,
        is1080p: true,
        isBR: true,
        isJP: true,
        isUS: true,
        isBestScenes: true,
        isMelhoresCenas: true,
        isAllScenes: true,
        isTodasAsCenas: true,
      },
      blobUrl: "",
      monetizedUrl: "",
    };
  });
}

const catalog = [
  ...buildItems("anime", "animes"),
  ...buildItems("series", "series"),
  ...buildItems("movie", "movies"),
];

const content = `export const catalog = ${JSON.stringify(catalog, null, 2)};`;

fs.writeFileSync(
  path.join(process.cwd(), "app", "lib", "catalog.ts"),
  content
);

console.log("Catalog generated!");