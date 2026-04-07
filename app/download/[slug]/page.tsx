import fs from "fs";
import path from "path";
import { downloadLinks } from "@/app/lib/downloadLinks";

function formatFileName(name: string) {
  return decodeURIComponent(name)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function toPublicUrl(absPath: string) {
  const publicPath = path.join(process.cwd(), "public");
  const relative = path.relative(publicPath, absPath);

  return (
    "/" +
    relative
      .split(path.sep)
      .map((part) => encodeURIComponent(part))
      .join("/")
  );
}

function pickDirectFile(packPath: string) {
  if (!fs.existsSync(packPath)) return "";

  const files = fs
    .readdirSync(packPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

  const mp4Files = files
    .filter((file) => file.toLowerCase().endsWith(".mp4"))
    .sort((a, b) => a.localeCompare(b));

  if (mp4Files.length > 0) {
    return path.join(packPath, mp4Files[0]);
  }

  const zipFiles = files
    .filter((file) => file.toLowerCase().endsWith(".zip"))
    .sort((a, b) => a.localeCompare(b));

  if (zipFiles.length > 0) {
    return path.join(packPath, zipFiles[0]);
  }

  return "";
}

function resolveAnimeOrSeriesSlug(
  slug: string,
  rootFolder: "animes" | "series"
) {
  const rootPath = path.join(process.cwd(), "public", "downloads", rootFolder);
  if (!fs.existsSync(rootPath)) return "";

  const titles = fs
    .readdirSync(rootPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const title of titles) {
    const titlePath = path.join(rootPath, title);

    const characters = fs
      .readdirSync(titlePath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    for (const character of characters) {
      const characterPath = path.join(titlePath, character);

      const languages = fs
        .readdirSync(characterPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

      for (const language of languages) {
        const languagePath = path.join(characterPath, language);

        const seasons = fs
          .readdirSync(languagePath, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name);

        for (const season of seasons) {
          const seasonPath = path.join(languagePath, season);

          const packs = fs
            .readdirSync(seasonPath, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name);

          for (const pack of packs) {
            const generatedSlug = `${character}-${language}-${season}-${pack}`;

            if (generatedSlug === slug) {
              return pickDirectFile(path.join(seasonPath, pack));
            }
          }
        }
      }
    }
  }

  return "";
}

function resolveMovieSlug(slug: string) {
  const rootPath = path.join(process.cwd(), "public", "downloads", "movies");
  if (!fs.existsSync(rootPath)) return "";

  const titles = fs
    .readdirSync(rootPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const title of titles) {
    const titlePath = path.join(rootPath, title);

    const characters = fs
      .readdirSync(titlePath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    for (const character of characters) {
      const characterPath = path.join(titlePath, character);

      const languages = fs
        .readdirSync(characterPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

      for (const language of languages) {
        const languagePath = path.join(characterPath, language);

        const packs = fs
          .readdirSync(languagePath, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name);

        for (const pack of packs) {
          const generatedSlug = `${character}-${language}--${pack}`;

          if (generatedSlug === slug) {
            return pickDirectFile(path.join(languagePath, pack));
          }
        }
      }
    }
  }

  return "";
}

function resolveDirectDownload(slug: string) {
  const animeFile = resolveAnimeOrSeriesSlug(slug, "animes");
  if (animeFile) return animeFile;

  const seriesFile = resolveAnimeOrSeriesSlug(slug, "series");
  if (seriesFile) return seriesFile;

  const movieFile = resolveMovieSlug(slug);
  if (movieFile) return movieFile;

  return "";
}

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const fileName = formatFileName(slug);
  const monetizedUrl = downloadLinks[slug];
  const directFile = monetizedUrl ? "" : resolveDirectDownload(slug);
  const directUrl = directFile ? toPublicUrl(directFile) : "";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        color: "white",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "620px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "22px",
          padding: "42px 34px",
          textAlign: "center",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <h1
          style={{
            fontSize: "34px",
            margin: "0 0 12px 0",
            fontWeight: 800,
            color: "#f8fafc",
          }}
        >
          Download Ready
        </h1>

        <p
          style={{
            color: "#cbd5e1",
            marginBottom: "24px",
            fontSize: "15px",
          }}
        >
          {monetizedUrl
            ? "Your file is ready. Continue to unlock the download."
            : directUrl
            ? "Your file is ready for direct download."
            : "Download unavailable for now."}
        </p>

        <div
          style={{
            marginBottom: "28px",
            padding: "14px 16px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#f8fafc",
            fontWeight: 700,
            wordBreak: "break-word",
          }}
        >
          {fileName}
        </div>

        {monetizedUrl ? (
          <a
            href={monetizedUrl}
            target="_blank"
            rel="noreferrer"
            className="downloadBtn"
          >
            Continue to Download
          </a>
        ) : directUrl ? (
          <a
            href={directUrl}
            download
            className="downloadBtn"
          >
            Download MP4
          </a>
        ) : (
          <div
            style={{
              color: "#fca5a5",
              fontWeight: 700,
              fontSize: "15px",
            }}
          >
            Download unavailable for now
          </div>
        )}

        <p
          style={{
            marginTop: "20px",
            fontSize: "12px",
            color: "#94a3b8",
            lineHeight: 1.6,
          }}
        >
          Thanks for supporting the site ❤️
        </p>
      </div>
    </main>
  );
}