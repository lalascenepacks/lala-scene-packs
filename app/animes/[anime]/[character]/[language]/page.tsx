import fs from "fs";
import path from "path";
import Link from "next/link";

export default async function LanguagePage({
  params,
}: {
  params: Promise<{ anime: string; character: string; language: string }>;
}) {
  const { anime, character, language } = await params;

  const languagePath = path.join(
    process.cwd(),
    "public",
    "downloads",
    "animes",
    anime,
    character,
    language
  );

  let seasons: string[] = [];

  if (fs.existsSync(languagePath)) {
    seasons = fs
      .readdirSync(languagePath, { withFileTypes: true })
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
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
          {character.replaceAll("-", " ")} - {language.toUpperCase()}
        </h1>

        <p style={{ color: "#b3b3b3", marginBottom: "30px" }}>
          Choose season
        </p>

        <div style={{ display: "grid", gap: "12px" }}>
          {seasons.map((season) => (
            <Link
              key={season}
              href={`/animes/${anime}/${character}/${language}/${season}`}
              style={{
                background: "#15151d",
                padding: "16px",
                borderRadius: "10px",
                color: "white",
                textDecoration: "none",
              }}
            >
              {season.replaceAll("-", " ")}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}