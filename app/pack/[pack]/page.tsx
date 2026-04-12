import Link from "next/link";
import { packsCatalog } from "@/app/lib/packsCatalog";

function formatLabel(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function detectQuality(values: string[]) {
  const text = values.join(" ").toLowerCase();

  if (text.includes("4k") || text.includes("2160p") || text.includes("uhd")) {
    return "4K";
  }

  if (text.includes("1080p") || text.includes("full hd")) {
    return "1080P";
  }

  if (text.includes("720p")) {
    return "720P";
  }

  return "Unknown";
}

function parsePackSlug(decodedPack: string) {
  const parts = decodedPack.split("-");
  const languageOptions = ["br", "jp", "us"];

  const languageIndex = parts.findIndex((part) =>
    languageOptions.includes(part.toLowerCase())
  );

  let character = "Unknown Character";
  let language = "Unknown";
  let season = "";
  let packType = "Unknown Pack";

  if (languageIndex !== -1) {
    character = formatLabel(parts.slice(0, languageIndex).join("-"));
    language = parts[languageIndex].toUpperCase();

    const afterLanguage = parts.slice(languageIndex + 1);

    if (afterLanguage.length >= 2) {
      const possibleSeason = afterLanguage.slice(0, 2).join("-");

      if (
        possibleSeason.toLowerCase().startsWith("season-") ||
        possibleSeason.toLowerCase().startsWith("temporada-")
      ) {
        season = formatLabel(possibleSeason);
        packType = formatLabel(afterLanguage.slice(2).join("-"));
      } else {
        packType = formatLabel(afterLanguage.join("-"));
      }
    } else {
      packType = formatLabel(afterLanguage.join("-"));
    }
  } else {
    packType = formatLabel(decodedPack);
  }

  return {
    character,
    language,
    season,
    packType,
  };
}

function getPackItems(decodedPack: string) {
  const normalizedSlug = normalizeSlug(decodedPack);

  return packsCatalog.filter((item) => {
    const itemSlug =
      item.mediaType === "movie"
        ? normalizeSlug(`${item.character}-${item.language}--${item.pack}`)
        : normalizeSlug(
            `${item.character}-${item.language}-${item.season}-${item.pack}`
          );

    return itemSlug === normalizedSlug;
  });
}

function getPackStatsFromCatalog(decodedPack: string) {
  const packItems = getPackItems(decodedPack);

  if (packItems.length === 0) {
    return {
      clipsCount: "—",
      size: "—",
      quality: detectQuality([decodedPack]),
    };
  }

  const files = packItems.map((item) => item.file);
  const clipFiles = files.filter((file) => file.toLowerCase().endsWith(".mp4"));
  const visibleFiles = files.filter((file) => {
    const lower = file.toLowerCase();
    return (
      lower.endsWith(".mp4") ||
      lower.endsWith(".zip") ||
      lower.endsWith(".rar") ||
      lower.endsWith(".7z")
    );
  });

  const count = clipFiles.length > 0 ? clipFiles.length : visibleFiles.length;

  return {
    clipsCount: count > 0 ? String(count) : "—",
    size: "—",
    quality: detectQuality(files.length > 0 ? files : [decodedPack]),
  };
}

export default async function PackPage({
  params,
}: {
  params: Promise<{ pack: string }>;
}) {
  const { pack } = await params;
  const decodedPack = decodeURIComponent(pack);

  const { character, language, season, packType } = parsePackSlug(decodedPack);
  const stats = getPackStatsFromCatalog(decodedPack);

  const hasPreview = decodedPack.toLowerCase().includes("megumi");

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 24px 70px",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              margin: "0 0 8px 0",
              color: "#93c5fd",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.4px",
              textTransform: "uppercase",
            }}
          >
            Pack Preview
          </p>

          <h1
            style={{
              fontSize: "48px",
              fontWeight: 900,
              lineHeight: 1.05,
              margin: "0 0 10px 0",
              color: "#f8fafc",
            }}
          >
            {character}
          </h1>

          <p
            style={{
              margin: 0,
              color: "#cbd5e1",
              fontSize: "17px",
              fontWeight: 500,
            }}
          >
            {packType}
            {season ? ` • ${season}` : ""}
            {language !== "Unknown" ? ` • ${language}` : ""}
          </p>
        </div>

        <div
          id="preview"
          style={{
            borderRadius: "22px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
            marginBottom: "26px",
            minHeight: "320px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {hasPreview ? (
            <video
              src="/preview/megumi.mp4"
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: "100%",
                display: "block",
                background: "black",
              }}
            />
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              Preview unavailable at the moment
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {[
            { label: "Clips", value: stats.clipsCount },
            { label: "Quality", value: stats.quality },
            { label: "Language", value: language },
            { label: "Size", value: stats.size },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: "16px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "8px",
                  fontWeight: 700,
                }}
              >
                {item.label}
              </div>

              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#f8fafc",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginBottom: "30px",
          }}
        >
          <Link
            href={`/download/${encodeURIComponent(decodedPack)}`}
            className="uiBtn uiBtnPrimary actionCard"
          >
            <span className="actionLabel">Action</span>
            <span className="actionTitle">Download Pack</span>
          </Link>

          <a
            href="https://discord.gg/p6U9HSCx"
            target="_blank"
            rel="noreferrer"
            className="uiBtn uiBtnGhost actionCard"
          >
            <span className="actionLabel">Community</span>
            <span className="actionTitle">Discord</span>
          </a>
        </div>

        <div
          style={{
            padding: "22px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2
            style={{
              margin: "0 0 14px 0",
              fontSize: "22px",
              fontWeight: 800,
              color: "#f8fafc",
            }}
          >
            Pack Details
          </h2>

          <p
            style={{
              margin: 0,
              color: "#cbd5e1",
              lineHeight: 1.7,
              fontSize: "15px",
            }}
          >
            This pack includes clips organized for editing, with scenes selected
            for quality, flow and usability. Use the preview above to check the
            style before downloading.
          </p>
        </div>
      </div>
    </main>
  );
}