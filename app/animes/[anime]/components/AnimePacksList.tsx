"use client";

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

export default function AnimePacksList({
  packs,
}: {
  packs: PackItem[];
}) {
  const grouped: Record<string, PackItem[]> = {};

  packs.forEach((pack) => {
    if (!grouped[pack.character]) {
      grouped[pack.character] = [];
    }
    grouped[pack.character].push(pack);
  });

  const characters = Object.keys(grouped).sort();

  return (
    <div>
      {characters.map((character) => (
        <div key={character} style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "28px",
              marginBottom: "10px",
              textTransform: "capitalize",
            }}
          >
            {character.replace(/-/g, " ")}
          </h2>

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

            {grouped[character].map((item) => (
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
                    {item.file.match(/\d{2}x\d{2}/)?.[0] || ""} @lalascenepacks
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
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}