"use client";

import { useState } from "react";

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
  isMonetized: boolean;
};

function getSubtitle(fileName: string) {
  const clean = fileName.replace(/\.[^/.]+$/, "");

  const partMatch = clean.match(/parte\s*\d+/i);

  const rangeMatch =
    clean.match(/(\d{1,2}x\d{1,2})\s*[-–]\s*(\d{1,2})/i) ||
    clean.match(/(s\d{1,2}e\d{1,2})\s*[-–]\s*(e?\d{1,2})/i);

  const episodeMatch =
    clean.match(/(\d{1,2}x\d{1,2})/i) ||
    clean.match(/(s\d{1,2}e\d{1,2})/i);

  const userMatch = clean.match(/(@[a-zA-Z0-9_.]+)/);

  if (partMatch) {
    return `${partMatch[0].replace(/parte/i, "Parte")}${
      userMatch ? ` ${userMatch[0]}` : ""
    }`;
  }

  if (rangeMatch) {
    return `${rangeMatch[1].toUpperCase()} - ${rangeMatch[2].toUpperCase()}${
      userMatch ? ` ${userMatch[0]}` : ""
    }`;
  }

  if (episodeMatch) {
    return `${episodeMatch[0].toUpperCase()}${
      userMatch ? ` ${userMatch[0]}` : ""
    }`;
  }

  return userMatch ? userMatch[0] : clean;
}

function getQuality(fileName: string) {
  const match = fileName.match(/(1080p|720p|2160p|4k)/i);
  return match ? match[0].toUpperCase() : "1080P";
}

export default function SeriesCharactersAccordion({
  grouped,
}: {
  grouped: Record<string, PackItem[]>;
}) {
  const [openCharacter, setOpenCharacter] = useState<string | null>(null);

  const characters = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  return (
    <div>
      {characters.map((character) => {
        const packs = grouped[character] || [];
        const isOpen = openCharacter === character;

        return (
          <div
          id={character.toLowerCase()}  
          key={character}
            style={{
              marginBottom: "18px",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px",
              overflow: "hidden",
              background: "rgba(255,255,255,0.04)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
          >
            <button
              onClick={() => setOpenCharacter(isOpen ? null : character)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "white",
                padding: "20px 22px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textAlign: "left",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    textTransform: "capitalize",
                    marginBottom: "6px",
                  }}
                >
                  {character.replaceAll("-", " ")}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#cbd5e1",
                  }}
                >
                  {packs.length} pack{packs.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                {isOpen ? "▲" : "▼"}
              </div>
            </button>

            {isOpen && (
              <div>
                {packs.map((item) => (
                  <div
                    key={item.href}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.8fr 120px 140px 120px 140px",
                      padding: "18px 20px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "bold",
                          marginBottom: "6px",
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
  {item.isMonetized
    ? "@lalascenepacks"
    : getSubtitle(item.file)}
</div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      {item.language.toUpperCase()}
                    </div>

                    <div style={{ textAlign: "center" }}>
                      {item.season.replaceAll("-", " ")}
                    </div>

                    <div style={{ textAlign: "center" }}>
                      {getQuality(item.file)}
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <a
  href={`/pack/${encodeURIComponent(
    `${item.character}-${item.language}-${item.season}-${item.pack}`
  )}`}
  className="downloadBtn"
>
  Download
</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}