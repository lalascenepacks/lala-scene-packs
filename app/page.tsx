import fs from "fs";
import path from "path";
import HomeFilter from "./components/HomeFilter";
import HomeCard from "./components/HomeCard"
import { downloadLinks } from "./lib/downloadLinks";
import { catalog } from "./lib/catalog";

type HomeItem = {
  title?: string;
  name: string;
  href: string;
  cover: string;
  mp4Count: number;
  scenePacksCount: number;
  type: "anime" | "series" | "movie";
  latestUpdatedAt: number;
  flags: {
    is4k: boolean;
    is1080p: boolean;
    isBR: boolean;
    isJP: boolean;
    isUS: boolean;
    isBestScenes: boolean;
    isMelhoresCenas: boolean;
    isAllScenes: boolean;
    isTodasAsCenas: boolean;
  };
};

function getFolders(folderPath: string) {
  if (!fs.existsSync(folderPath)) return [];

  return fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);
}

function countAvailableDownloads(
  folderName: "animes" | "series" | "movies",
  itemName: string
) {
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
          const slug = `${character}-${language}--${pack}`;
          const packPath = path.join(languagePath, pack);

          if (normalizedDownloadLinks[normalizeSlug(slug)]) {
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
            const slug = `${character}-${language}-${season}-${pack}`;
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

function countNestedScenePacks(folderPath: string, hasSeason: boolean) {
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

function getLatestUpdatedAt(folderPath: string) {
  if (!fs.existsSync(folderPath)) return 0;

  let latest = 0;

  function walk(currentPath: string) {
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

function getFlags(folderPath: string) {
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

  function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

  if (!fs.existsSync(folderPath)) return flags;

  function walk(currentPath: string) {
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

function buildItems(
  type: "anime" | "series" | "movie",
  folderName: "animes" | "series" | "movies",
  coverFolder: "animes" | "series" | "movies",
  names: string[]
): HomeItem[] {
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
      mp4Count: countAvailableDownloads(folderName, item),
      scenePacksCount: countNestedScenePacks(itemFolderPath, hasSeason),
      latestUpdatedAt: getLatestUpdatedAt(itemFolderPath),
      flags: getFlags(itemFolderPath),
      type,
    };
  });
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function renderHomeCard(item: HomeItem, index: number) {
  return (
    <HomeCard
      key={`${item.type}-${item.href}-${index}`}
      item={item}
      width="200px"
      height="300px"
      recent
    />
  );
}

const normalizedDownloadLinks = Object.fromEntries(
  Object.entries(downloadLinks).map(([key, value]) => [
    normalizeSlug(key),
    value,
  ])
);

export default function HomePage() {
  const animeItems = catalog.filter(
  (item) => item.type === "anime"
) as HomeItem[];

const seriesItems = catalog.filter(
  (item) => item.type === "series"
) as HomeItem[];

const movieItems = catalog.filter(
  (item) => item.type === "movie"
) as HomeItem[];

  const allItems = [...animeItems, ...seriesItems, ...movieItems];

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const recentItems = [...allItems]
    .filter(
      (item) =>
        item.latestUpdatedAt > 0 && now - item.latestUpdatedAt <= ONE_WEEK_MS
    )
    .sort((a, b) => b.latestUpdatedAt - a.latestUpdatedAt)
    .slice(0, 14);

  const sections = [
    { title: "Anime", items: animeItems },
    { title: "Series", items: seriesItems },
    { title: "Movies", items: movieItems },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "white",
        padding: "36px 0 56px",
      }}
    >
      <div className="homePageWrap">
        <section className="homeHero">
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 30%), radial-gradient(circle at 80% 30%, rgba(125,211,252,0.08), transparent 25%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: "880px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              {["4K", "1080p", "All Scenes", "Best Sequences"].map((tag) => (
                <div
                  key={tag}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#cbd5e1",
                    fontSize: "12px",
                    letterSpacing: "0.4px",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>

            <h1 className="homeHeroTitle">Browse Scenepacks</h1>

            <p className="homeHeroText">
              Explore anime, series and movie scenepacks in one place, with a
              clean catalog, fast search and organized character pages.
            </p>
          </div>
        </section>

        {recentItems.length > 0 && (
          <section style={{ marginBottom: "96px" }}>
            <h2
              style={{
                fontSize: "28px",
                marginBottom: "20px",
                fontWeight: 800,
                color: "#f8fafc",
              }}
            >
              Recent Uploads
            </h2>

            <div className="homeCardsGrid">
              {recentItems.map((item, index) => renderHomeCard(item, index))}
            </div>
          </section>
        )}

        <HomeFilter allItems={allItems} sections={sections} />
      </div>
    </main>
  );
}