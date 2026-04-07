import fs from "fs";
import path from "path";

type PackItem = {
  title: string;
  character: string;
  language: string;
  season: string;
  pack: string;
  file: string;
  href: string;
  updatedAt: number;
  updatedAtText: string;
};

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US");
}

function formatLabel(value: string) {
  return value.replaceAll("-", " ");
}

function getCharacterPacks(anime: string, character: string): PackItem[] {
  const characterPath = path.join(
    process.cwd(),
    "public",
    "downloads",
    "animes",
    anime,
    character
  );

  const items: PackItem[] = [];

  if (!fs.existsSync(characterPath)) return items;

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
        .filter((item) => item.isDirectory())
        .map((item) => item.name);

      for (const pack of packs) {
        const packPath = path.join(seasonPath, pack);
        if (!fs.existsSync(packPath)) continue;

        const files = fs
          .readdirSync(packPath, { withFileTypes: true })
          .filter((item) => item.isFile())
          .map((item) => item.name)
          .filter((file) => {
            const lower = file.toLowerCase();
            return lower.endsWith(".mp4") || lower.endsWith(".zip");
          });

        for (const file of files) {
          const filePath = path.join(packPath, file);
          const stat = fs.statSync(filePath);

          items.push({
            title: `${formatLabel(character)} - ${formatLabel(pack)}`,
            character,
            language,
            season,
            pack,
            file,
            href: `/downloads/animes/${anime}/${character}/${language}/${season}/${pack}/${file}`,
            updatedAt: stat.mtimeMs,
            updatedAtText: formatDate(stat.mtimeMs),
          });
        }
      }
    }
  }

  return items.sort((a, b) => b.updatedAt - a.updatedAt);
}

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ anime: string; character: string }>;
}) {
  const { anime, character } = await params;

  const packs = getCharacterPacks(anime, character);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to right, #0f172a 0%, #0a0f1a 45%, #13133a 100%)",
        color: "white",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: "40px",
            alignItems: "start",
          }}
        >
          <div>
            <img
              src={`/covers/animes/${anime}.jpeg`}
              alt={anime}
              style={{
                width: "100%",
                borderRadius: "18px",
                objectFit: "cover",
                display: "block",
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              }}
            />
          </div>

          <div>
            <a
              href={`/animes/${anime}`}
              style={{
                display: "inline-block",
                marginBottom: "20px",
                color: "#93c5fd",
                textDecoration: "none",
              }}
            >
              ← Back to {formatLabel(anime)}
            </a>

            <h1
              style={{
                fontSize: "42px",
                marginBottom: "8px",
                textTransform: "capitalize",
              }}
            >
              {formatLabel(character)}
            </h1>

            <p style={{ color: "#7ee0a1", marginBottom: "30px" }}>
              {packs.length} scenepacks available
            </p>

            <div
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.8fr 140px 140px 140px 160px",
                  padding: "16px 20px",
                  fontSize: "13px",
                  color: "#aab3c5",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  fontWeight: "bold",
                }}
              >
                <div>SCENEPACK</div>
                <div>LANGUAGE</div>
                <div>SEASON</div>
                <div>DATE</div>
                <div>DOWNLOAD</div>
              </div>

              {packs.length === 0 ? (
                <div style={{ padding: "24px 20px", color: "#aab3c5" }}>
                  No packs found for this character.
                </div>
              ) : (
                packs.map((item) => (
                  <div
                    key={item.href}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.8fr 140px 140px 140px 160px",
                      padding: "18px 20px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "bold",
                          marginBottom: "4px",
                        }}
                      >
                        {item.title}
                      </div>

                      <div
                        style={{
                          color: "#8f9ab0",
                          fontSize: "12px",
                        }}
                      >
                        {item.file.match(/\d{2}x\d{2}/)?.[0] || ""} @allaeditsscp
                      </div>
                    </div>

                    <div>{item.language.toUpperCase()}</div>
                    <div>{item.season.replace(/-/g, " ")}</div>
                    <div>{item.updatedAtText}</div>

                    <div>
                      <a
                        href={item.href}
                        style={{
                          background: "#3b82f6",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          color: "white",
                          textDecoration: "none",
                          fontSize: "13px",
                        }}
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}