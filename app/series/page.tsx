import fs from "fs";
import path from "path";
import Link from "next/link";
import HomeCard from "@/app/components/HomeCard";

type HomeItem = {
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

function countMp4Files(folderPath: string) {
  if (!fs.existsSync(folderPath)) return 0;

  let total = 0;

  function walk(currentPath: string) {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);

      if (item.isDirectory()) {
        walk(fullPath);
      } else if (item.isFile() && item.name.toLowerCase().endsWith(".mp4")) {
        total++;
      }
    }
  }

  walk(folderPath);
  return total;
}

function countNestedScenePacks(folderPath: string) {
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
    }
  }

  return total;
}

function sortButton(active: boolean, label: string, href: string) {
  return (
    <Link
      href={href}
      style={{
        padding: "8px 14px",
        borderRadius: "12px",
        border: active
          ? "1px solid rgba(96,165,250,0.6)"
          : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? "rgba(96,165,250,0.18)"
          : "rgba(255,255,255,0.04)",
        color: "white",
        fontWeight: 700,
        cursor: "pointer",
        textDecoration: "none",
        fontSize: "14px",
      }}
    >
      {label}
    </Link>
  );
}

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sort = params.sort === "packs" || params.sort === "az" ? params.sort : "recent";

  const basePath = path.join(process.cwd(), "public", "downloads", "series");
  const series = getFolders(basePath);

  const items: HomeItem[] = series.map((serie) => {
    const seriePath = path.join(basePath, serie);

    return {
      name: serie,
      href: `/series/${serie}`,
      cover: `/covers/series/${serie}.jpeg`,
      mp4Count: countMp4Files(seriePath),
      scenePacksCount: countNestedScenePacks(seriePath),
      latestUpdatedAt: getLatestUpdatedAt(seriePath),
      flags: getFlags(seriePath),
      type: "series",
    };
  });

  if (sort === "recent") {
    items.sort((a, b) => b.latestUpdatedAt - a.latestUpdatedAt);
  } else if (sort === "packs") {
    items.sort((a, b) => b.scenePacksCount - a.scenePacksCount);
  } else if (sort === "az") {
    items.sort((a, b) => a.name.localeCompare(b.name));
  }

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
        <section className="homeHero" style={{ marginBottom: "40px" }}>
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
              {["Series", `${items.length} Titles`, "Scene Packs"].map((tag) => (
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

            <h1 className="homeHeroTitle">Browse Series</h1>

            <p className="homeHeroText">
              Explore all available series scene packs in one place, with fast
              navigation, clean covers, and organized character pages.
            </p>
          </div>
        </section>

        {items.length === 0 ? (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px",
              padding: "20px",
              color: "#aab3c5",
            }}
          >
            No series found.
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "14px",
                }}
              >
                {items.length} result{items.length !== 1 ? "s" : ""}
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {sortButton(sort === "recent", "Recent", "/series?sort=recent")}
                {sortButton(sort === "packs", "Most Packs", "/series?sort=packs")}
                {sortButton(sort === "az", "A–Z", "/series?sort=az")}
              </div>
            </div>

            <div className="homeCardsGrid">
              {items.map((item) => (
                <HomeCard
                  key={item.href}
                  item={item}
                  width="220px"
                  height="320px"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}