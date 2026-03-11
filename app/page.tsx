import Link from "next/link";

export default function Home() {
  const packs = [
    {
      slug: "city-night",
      title: "City at Night",
      image: "/covers/city-night.jpeg",
    },
    {
      slug: "landscape",
      title: "Landscape",
      image: "/covers/landscape.jpeg",
    },
    {
      slug: "nature",
      title: "Nature",
      image: "/covers/nature.jpeg",
    },
  ];

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
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>Scene Packs</h1>
        <p style={{ color: "#b3b3b3", fontSize: "18px", marginBottom: "40px" }}>
          Download high quality scene packs.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {packs.map((pack) => (
            <div
              key={pack.slug}
              style={{
                background: "#15151d",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
              }}
            >
              <Link href={`/videos/${pack.slug}`}>
                <img
                  src={pack.image}
                  alt={pack.title}
                  style={{
                    width: "100%",
                    height: "380px",
                    objectFit: "cover",
                    display: "block",
                    cursor: "pointer",
                  }}
                />
              </Link>

              <div style={{ padding: "18px" }}>
                <h3 style={{ margin: "0 0 14px 0", fontSize: "20px" }}>
                  {pack.title}
                </h3>

                <Link href={`/videos/${pack.slug}`}>
                  <button
                    style={{
                      background: "#ffffff",
                      color: "#000",
                      border: "none",
                      padding: "12px 18px",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    View Pack
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
