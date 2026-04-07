import fs from "fs";
import path from "path";
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

export default function AnimesPage() {
  const basePath = path.join(process.cwd(), "public", "downloads", "animes");
  const animes = getFolders(basePath);

  const items: HomeItem[] = animes.map((anime) => {
    const animePath = path.join(basePath, anime);

    return {
      name: anime,
      href: `/animes/${anime}`,
      cover: `/covers/animes/${anime}.jpeg`,
      mp4Count: countMp4Files(animePath),
      scenePacksCount: countNestedScenePacks(animePath),
      latestUpdatedAt: getLatestUpdatedAt(animePath),
      flags: getFlags(animePath),
      type: "anime",
    };
  });

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

          <div style={{ position: "relative", zIndex: 2, maxWidth: "880px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {["Anime", `${items.length} Titles`, "Scene Packs"].map((tag) => (
                <div
                  key={tag}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#cbd5e1",
                    fontSize: "12px",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>

            <h1 className="homeHeroTitle">Browse Anime</h1>

            <p className="homeHeroText">
              Explore all anime scene packs with organized characters, clean
              covers, and fast navigation.
            </p>
          </div>
        </section>

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
      </div>
    </main>
  );
}