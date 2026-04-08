import HomeCard from "@/app/components/HomeCard";
import { catalog } from "@/app/lib/catalog";

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

export default function AnimesPage() {
  const items: HomeItem[] = catalog
    .filter((item) => item.type === "anime")
    .map((item) => ({
      ...item,
      type: "anime",
    }));

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