import fs from "fs";
import path from "path";

const LOOTLABS_API_URL = "https://creators.lootlabs.gg/api/public/content_locker";
const API_TOKEN = process.env.LOOTLABS_API_TOKEN;
const NUMBER_OF_TASKS = Number(process.env.LOOTLABS_TASKS || 2);
const TIER_ID = 2;
const THEME = 5;

console.log("Iniciando generateLootLinks...");

if (!API_TOKEN) {
  throw new Error("LOOTLABS_API_TOKEN não encontrado no .env.local");
}

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

function pretty(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

function getPackLabel(pack) {
  const p = pack.pack.toLowerCase();

  if (p.includes("melhores")) return "Melhores Cenas";
  if (p.includes("todas")) return "Todas as Cenas";
  if (p.includes("best")) return "Best Scenes";
  if (p.includes("all")) return "All Scenes";

  return pretty(pack.pack);
}

function getSeasonShort(pack) {
  if (!pack.season) return "";

  const num = pack.season.match(/\d+/)?.[0];
  if (!num) return "";

  if (pack.season.toLowerCase().includes("temporada")) {
    return `T${num}`;
  }

  return `S${num}`;
}

function readPacksCatalog() {
  const filePath = path.join(process.cwd(), "app", "lib", "packsCatalog.ts");
  const content = fs.readFileSync(filePath, "utf8");

  const match = content.match(
    /export const packsCatalog: PackCatalogItem\[] = (\[[\s\S]*?\]);/
  );

  if (!match) {
    throw new Error("Não consegui ler packsCatalog.ts");
  }

  return JSON.parse(match[1]);
}

function readDownloadLinks() {
  const filePath = path.join(process.cwd(), "app", "lib", "downloadLinks.ts");
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, "utf8");
  const matches = [...content.matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)];

  const links = {};
  for (const match of matches) {
    links[normalizeSlug(match[1])] = match[2];
  }

  return links;
}

function writeDownloadLinks(downloadLinks) {
  const filePath = path.join(process.cwd(), "app", "lib", "downloadLinks.ts");

  const entries = Object.entries(downloadLinks).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const body = entries
    .map(([key, value]) => `  "${key}": "${value}",`)
    .join("\n");

  fs.writeFileSync(
    filePath,
    `export const downloadLinks: Record<string, string> = {\n${body}\n};\n`,
    "utf8"
  );
}

function buildSlug(pack) {
  if (pack.mediaType === "movie") {
    return normalizeSlug(`${pack.character}-${pack.language}--${pack.pack}`);
  }

  return normalizeSlug(
    `${pack.character}-${pack.language}-${pack.season}-${pack.pack}`
  );
}

function buildTitle(pack) {
  const language = (pack.language || "").toUpperCase();
  const season = getSeasonShort(pack);

  return [language, season].filter(Boolean).join(" ");
}

async function createLootLink(pack) {
  const linkName = `${pretty(pack.character)} ${getPackLabel(pack)}`;
  const title = buildTitle(pack);
  const destinationUrl = pack.href;

  const payload = {
    title,
    name: linkName,
    link_name: linkName,

    url: destinationUrl,
    destination_url: destinationUrl,
    target_url: destinationUrl,

    url_mode: true,
    text_mode: false,

    tier_id: Number(TIER_ID),
    number_of_tasks: Number(NUMBER_OF_TASKS),
    theme: Number(THEME),
  };

  console.log("Payload enviado:", payload);

  const response = await fetch(LOOTLABS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  console.log("Resposta LootLabs:", data);

  if (!response.ok || data?.type === "error") {
    throw new Error(data?.message || JSON.stringify(data));
  }

  const lootUrl = Array.isArray(data?.message)
    ? data.message[0]?.loot_url
    : data?.message?.loot_url || data?.loot_url;

  if (!lootUrl) {
    throw new Error(
      `LootLabs criou, mas não retornou loot_url: ${JSON.stringify(data)}`
    );
  }

  return lootUrl;
}

async function main() {
  const packsCatalog = readPacksCatalog();
  const downloadLinks = readDownloadLinks();

  console.log(`Total no packsCatalog: ${packsCatalog.length}`);

  const missingPacks = packsCatalog.filter((pack) => {
    const slug = buildSlug(pack);
    return !downloadLinks[slug] && !!pack.href && pack.isMonetized === false;
  });

  console.log(`Packs sem link monetizado: ${missingPacks.length}`);

  for (const pack of missingPacks) {
    const slug = buildSlug(pack);

    console.log(`Criando LootLabs: ${slug}`);
    console.log(`URL: ${pack.href}`);

    try {
      const lootUrl = await createLootLink(pack);

      if (!lootUrl) {
        throw new Error("LootLabs não retornou link.");
      }

      downloadLinks[slug] = lootUrl;
      console.log(`OK: ${slug} -> ${lootUrl}`);
    } catch (error) {
      console.error(`ERRO em ${slug}`);
      console.error(error.message || error);
    }
  }

  writeDownloadLinks(downloadLinks);
  console.log("downloadLinks.ts atualizado.");
}

main().catch((error) => {
  console.error("ERRO GERAL:");
  console.error(error);
  process.exit(1);
});