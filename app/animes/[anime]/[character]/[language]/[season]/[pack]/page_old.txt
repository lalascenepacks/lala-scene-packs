import { packsCatalog } from "@/app/lib/packsCatalog";

export default async function PackPage({
  params,
}: {
  params: Promise<{
    anime: string;
    character: string;
    language: string;
    season: string;
    pack: string;
  }>;
}) {
  const { anime, character, language, season, pack } = await params;

  const files = packsCatalog
    .filter(
      (item) =>
        item.mediaType === "anime" &&
        item.mediaSlug === anime &&
        item.character === character &&
        item.language === language &&
        item.season === season &&
        item.pack === pack
    )
    .map((item) => ({
      file: item.file,
      href: item.href,
    }));

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0b0b0f",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>
          {character.replaceAll("-", " ")} — {pack.replaceAll("-", " ")}
        </h1>

        <div style={{ display: "grid", gap: "12px" }}>
          {files.map((item) => (
            <a
              key={item.file}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#15151d",
                padding: "16px",
                borderRadius: "10px",
                color: "white",
                textDecoration: "none",
              }}
            >
              Download {item.file}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}