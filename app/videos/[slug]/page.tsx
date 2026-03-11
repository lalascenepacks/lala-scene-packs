const packs = [
  {
    slug: "city-night",
    title: "City at Night",
    image: "/covers/city-night.jpeg",
    file: "/downloads/city-night.zip",
  },
  {
    slug: "landscape",
    title: "Landscape",
    image: "/covers/landscape.jpeg",
    file: "/downloads/landscape.zip",
  },
  {
    slug: "nature",
    title: "Nature",
    image: "/covers/nature.jpeg",
    file: "/downloads/nature.zip",
  },
];

export default async function PackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const pack = packs.find((item) => item.slug === slug);

  if (!pack) {
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
        <h1>Pack not found</h1>
      </main>
    );
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
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>{pack.title}</h1>

        <img
          src={pack.image}
          alt={pack.title}
          style={{
            width: "100%",
            maxWidth: "700px",
            borderRadius: "16px",
            display: "block",
            marginBottom: "24px",
          }}
        />

        <p style={{ color: "#b3b3b3", fontSize: "18px", marginBottom: "24px" }}>
          Scene pack available for download.
        </p>

        <a href={pack.file} download>
          <button
            style={{
              background: "#ffffff",
              color: "#000",
              border: "none",
              padding: "14px 22px",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Download Pack
          </button>
        </a>
      </div>
    </main>
  );
}
