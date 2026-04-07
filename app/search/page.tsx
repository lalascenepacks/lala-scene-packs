import Link from "next/link";
import { getSearchItems } from "../lib/getSearchItems";

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getScore(
  item: {
    title: string;
    subtitle?: string;
    aliases?: string[];
  },
  query: string
) {
  const q = normalize(query);
  const title = normalize(item.title);
  const subtitle = normalize(item.subtitle || "");
  const aliases = (item.aliases || []).map(normalize);

  if (!q) return 0;

  if (title === q) return 1000;
  if (aliases.includes(q)) return 900;
  if (title.startsWith(q)) return 800;
  if (aliases.some((alias) => alias.startsWith(q))) return 700;
  if (title.includes(q)) return 600;
  if (aliases.some((alias) => alias.includes(q))) return 500;
  if (subtitle.startsWith(q)) return 400;
  if (subtitle.includes(q)) return 250;

  return 0;
}

function getTypeLabel(type: "anime" | "series" | "movie" | "character") {
  if (type === "anime") return "Anime";
  if (type === "series") return "Series";
  if (type === "movie") return "Movie";
  return "Character";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = normalize(q || "");

  const allItems = getSearchItems();

  const results = query
    ? [...allItems]
        .map((item) => ({
          ...item,
          score: getScore(item, query),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    : [];

  const totalResults = results.length;
  const topResults = results.slice(0, 5);

  const animeResults = results.filter((item) => item.type === "anime");
  const seriesResults = results.filter((item) => item.type === "series");
  const movieResults = results.filter((item) => item.type === "movie");
  const characterResults = results.filter((item) => item.type === "character");

  function renderEmpty(text: string) {
    return (
      <div
        style={{
          color: "#94a3b8",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "16px",
        }}
      >
        {text}
      </div>
    );
  }

  function renderTopResults() {
    if (topResults.length === 0) return renderEmpty("No top results found.");

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "18px",
        }}
      >
        {topResults.map((item, index) => (
          <Link
            key={`${item.type}-${item.href}-${index}`}
            href={item.href}
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "center",
              padding: "14px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              textDecoration: "none",
              color: "white",
              boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: "72px",
                height: "96px",
                objectFit: "cover",
                borderRadius: "12px",
                flexShrink: 0,
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  textTransform: "capitalize",
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#94a3b8",
                  marginTop: "6px",
                  textTransform: "capitalize",
                }}
              >
                {item.subtitle || getTypeLabel(item.type)}
              </div>

              <div
                style={{
                  marginTop: "8px",
                  display: "inline-flex",
                  padding: "5px 10px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: "rgba(96,165,250,0.16)",
                  border: "1px solid rgba(96,165,250,0.28)",
                  color: "#dbeafe",
                }}
              >
                {getTypeLabel(item.type)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  function renderGridCards(
    items: typeof results,
    emptyText: string
  ) {
    if (items.length === 0) return renderEmpty(emptyText);

    return (
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {items.map((item, index) => (
          <Link
            key={`${item.type}-${item.href}-${index}`}
            href={item.href}
            style={{
              width: "220px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px",
              overflow: "hidden",
              textDecoration: "none",
              color: "white",
              boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: "100%",
                height: "320px",
                objectFit: "cover",
                display: "block",
              }}
            />

            <div style={{ padding: "14px" }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                  marginTop: "6px",
                  textTransform: "capitalize",
                }}
              >
                {item.subtitle || getTypeLabel(item.type)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  function renderCharacterList(items: typeof characterResults) {
    if (items.length === 0) return renderEmpty("No character found.");

    return (
      <div
        style={{
          display: "grid",
          gap: "14px",
        }}
      >
        {items.map((item, index) => (
          <Link
            key={`${item.type}-${item.href}-${index}`}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "12px",
              textDecoration: "none",
              color: "white",
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: "62px",
                height: "82px",
                objectFit: "cover",
                borderRadius: "10px",
                flexShrink: 0,
              }}
            />

            <div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                  marginTop: "4px",
                  textTransform: "capitalize",
                }}
              >
                {item.subtitle}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #12355b 0%, #08111f 35%, #090b14 100%)",
        color: "white",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "44px",
            marginBottom: "8px",
            fontWeight: 900,
            color: "#f8fafc",
          }}
        >
          Search Results
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "16px",
            marginBottom: "28px",
          }}
        >
          {query ? `Results for "${q}"` : "Type something in the search bar."}
        </p>

        {!query ? (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px",
              padding: "20px",
              color: "#94a3b8",
            }}
          >
            Try searching for an anime, series, movie, or character.
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: "34px",
                padding: "14px 18px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#cbd5e1",
                fontSize: "14px",
              }}
            >
              {totalResults} result{totalResults !== 1 ? "s" : ""} found
            </div>

            <section style={{ marginBottom: "42px" }}>
              <h2
                style={{
                  fontSize: "28px",
                  marginBottom: "18px",
                  fontWeight: 800,
                  color: "#f8fafc",
                }}
              >
                Top Results
              </h2>
              {renderTopResults()}
            </section>

            <section style={{ marginBottom: "42px" }}>
              <h2
                style={{
                  fontSize: "28px",
                  marginBottom: "18px",
                  fontWeight: 800,
                  color: "#f8fafc",
                }}
              >
                Characters
              </h2>
              {renderCharacterList(characterResults)}
            </section>

            <section style={{ marginBottom: "42px" }}>
              <h2
                style={{
                  fontSize: "28px",
                  marginBottom: "18px",
                  fontWeight: 800,
                  color: "#f8fafc",
                }}
              >
                Anime
              </h2>
              {renderGridCards(animeResults, "No anime found.")}
            </section>

            <section style={{ marginBottom: "42px" }}>
              <h2
                style={{
                  fontSize: "28px",
                  marginBottom: "18px",
                  fontWeight: 800,
                  color: "#f8fafc",
                }}
              >
                Series
              </h2>
              {renderGridCards(seriesResults, "No series found.")}
            </section>

            <section>
              <h2
                style={{
                  fontSize: "28px",
                  marginBottom: "18px",
                  fontWeight: 800,
                  color: "#f8fafc",
                }}
              >
                Movies
              </h2>
              {renderGridCards(movieResults, "No movie found.")}
            </section>
          </>
        )}
      </div>
    </main>
  );
}