import fs from "fs";
import path from "path";

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

  const packPath = path.join(
    process.cwd(),
    "public",
    "downloads",
    "animes",
    anime,
    character,
    language,
    season,
    pack
  );

  let files: string[] = [];

  if (fs.existsSync(packPath)) {
    files = fs
      .readdirSync(packPath)
      .filter((file) => file.endsWith(".mp4") || file.endsWith(".zip"));
  }

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
          {files.map((file) => (
            <a
              key={file}
              href={`/downloads/animes/${anime}/${character}/${language}/${season}/${pack}/${file}`}
              download
              style={{
                background: "#15151d",
                padding: "16px",
                borderRadius: "10px",
                color: "white",
                textDecoration: "none",
              }}
            >
              Download {file}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}