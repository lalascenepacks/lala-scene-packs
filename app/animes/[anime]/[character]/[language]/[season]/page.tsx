import fs from "fs";
import path from "path";
import Link from "next/link";

export default async function SeasonPage({
  params,
}: {
  params: Promise<{
    anime: string;
    character: string;
    language: string;
    season: string;
  }>;
}) {
  const { anime, character, language, season } = await params;

  const seasonPath = path.join(
    process.cwd(),
    "public",
    "downloads",
    "animes",
    anime,
    character,
    language,
    season
  );

  let folders: string[] = [];

  if (fs.existsSync(seasonPath)) {
    folders = fs
      .readdirSync(seasonPath, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name);
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
          {character.replaceAll("-", " ")} — {season}
        </h1>

        <p style={{ color: "#aaa", marginBottom: "30px" }}>
          Choose pack
        </p>

        <div style={{ display: "grid", gap: "12px" }}>
          {folders.map((folder) => (
            <Link
              key={folder}
              href={`/animes/${anime}/${character}/${language}/${season}/${folder}`}
              style={{
                background: "#15151d",
                padding: "16px",
                borderRadius: "10px",
                color: "white",
                textDecoration: "none",
              }}
            >
              {folder.replaceAll("-", " ")}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}