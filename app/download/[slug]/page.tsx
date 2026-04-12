import { downloadLinks } from "@/app/lib/downloadLinks";
import { packsCatalog } from "@/app/lib/packsCatalog";

function formatFileName(name: string) {
  return decodeURIComponent(name)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
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

function resolvePackHref(slug: string) {
  const normalizedSlug = normalizeSlug(slug);

  const item = packsCatalog.find((pack) => {
    const packSlug =
      pack.mediaType === "movie"
        ? normalizeSlug(`${pack.character}-${pack.language}--${pack.pack}`)
        : normalizeSlug(
            `${pack.character}-${pack.language}-${pack.season}-${pack.pack}`
          );

    return packSlug === normalizedSlug;
  });

  return item?.href || "";
}

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const normalizedSlug = normalizeSlug(slug);
  const fileName = formatFileName(slug);

  const monetizedUrl = downloadLinks[normalizedSlug];
  const directUrl = monetizedUrl || resolvePackHref(normalizedSlug);

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
            target="_blank"
            rel="noreferrer"
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