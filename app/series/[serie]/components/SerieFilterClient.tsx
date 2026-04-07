"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SeriesCharactersAccordion from "./SeriesCharactersAccordion";

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

function formatLabel(value: string) {
  return value.replaceAll("-", " ");
}

function normalizeCharacter(value: string) {
  return value.toLowerCase();
}

function chip(active: boolean, label: string, onClick: () => void) {
  return (
    <button
      onClick={onClick}
      className={`uiChip ${active ? "uiChipActive" : ""}`}
    >
      {label}
    </button>
  );
}

export default function SerieFilterClient({
  serie,
  packs,
}: {
  serie: string;
  packs: PackItem[];
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchedCharacter, setSearchedCharacter] = useState("");

  const [draftLanguage, setDraftLanguage] = useState<"all" | "br" | "jp" | "us">("all");
  const [draftQuality, setDraftQuality] = useState<"all" | "4k" | "1080p">("all");
  const [draftStyle, setDraftStyle] = useState<
    "all" | "best-scenes" | "all-scenes" | "todas-as-cenas" | "melhores-cenas"
  >("all");

  const [language, setLanguage] = useState<"all" | "br" | "jp" | "us">("all");
  const [quality, setQuality] = useState<"all" | "4k" | "1080p">("all");
  const [style, setStyle] = useState<
    "all" | "best-scenes" | "all-scenes" | "todas-as-cenas" | "melhores-cenas"
  >("all");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function syncHashCharacter() {
      const hash = window.location.hash.replace("#", "").trim().toLowerCase();
      setSearchedCharacter(hash);
    }

    syncHashCharacter();
    window.addEventListener("hashchange", syncHashCharacter);

    return () => {
      window.removeEventListener("hashchange", syncHashCharacter);
    };
  }, []);

  function applyFilters() {
    setLanguage(draftLanguage);
    setQuality(draftQuality);
    setStyle(draftStyle);
    setIsOpen(false);
  }

  function clearAll() {
    setDraftLanguage("all");
    setDraftQuality("all");
    setDraftStyle("all");
    setLanguage("all");
    setQuality("all");
    setStyle("all");
    setIsOpen(false);
  }

  const filteredPacks = useMemo(() => {
    let result = [...packs];

    if (language !== "all") {
      result = result.filter(
        (pack) => pack.language.toLowerCase() === language
      );
    }

    if (quality === "4k") {
      result = result.filter((pack) => {
        const value = `${pack.pack} ${pack.file} ${pack.season}`.toLowerCase();
        return (
          value.includes("4k") ||
          value.includes("2160p") ||
          value.includes("uhd")
        );
      });
    }

    if (quality === "1080p") {
      result = result.filter((pack) => {
        const value = `${pack.pack} ${pack.file} ${pack.season}`.toLowerCase();
        return value.includes("1080p") || value.includes("full hd");
      });
    }

    if (style === "best-scenes") {
      result = result.filter((pack) => {
        const value = `${pack.pack} ${pack.file}`.toLowerCase();
        return value.includes("best-scenes") || value.includes("best scenes");
      });
    }

    if (style === "all-scenes") {
      result = result.filter((pack) => {
        const value = `${pack.pack} ${pack.file}`.toLowerCase();
        return value.includes("all-scenes") || value.includes("all scenes");
      });
    }

    if (style === "todas-as-cenas") {
      result = result.filter((pack) => {
        const value = `${pack.pack} ${pack.file}`.toLowerCase();
        return value.includes("todas-as-cenas") || value.includes("todas as cenas");
      });
    }

    if (style === "melhores-cenas") {
      result = result.filter((pack) => {
        const value = `${pack.pack} ${pack.file}`.toLowerCase();
        return value.includes("melhores-cenas") || value.includes("melhores cenas");
      });
    }

    return result;
  }, [packs, language, quality, style]);

  const grouped = useMemo(() => {
    return filteredPacks.reduce((acc, pack) => {
      if (!acc[pack.character]) acc[pack.character] = [];
      acc[pack.character].push(pack);
      return acc;
    }, {} as Record<string, PackItem[]>);
  }, [filteredPacks]);

  const visibleGrouped = useMemo(() => {
    if (!searchedCharacter) return grouped;

    const entry = Object.entries(grouped).find(
      ([character]) => normalizeCharacter(character) === searchedCharacter
    );

    if (!entry) return grouped;

    return {
      [entry[0]]: entry[1],
    };
  }, [grouped, searchedCharacter]);

  const totalCharacters = Object.keys(visibleGrouped).length;

  const activeFiltersCount = [
    language !== "all",
    quality !== "all",
    style !== "all",
  ].filter(Boolean).length;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "white",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "32px",
            alignItems: "start",
          }}
        >
          <aside
            style={{
              position: "sticky",
              top: "20px",
              height: "fit-content",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "14px",
                boxShadow: "0 14px 34px rgba(0,0,0,0.25)",
              }}
            >
              <img
                src={`/covers/series/${serie}.jpeg`}
                alt={serie}
                style={{
                  width: "100%",
                  borderRadius: "16px",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div
                style={{
                  marginTop: "14px",
                  padding: "14px",
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {totalCharacters}
                </div>

                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  characters
                </div>
              </div>
            </div>
          </aside>

          <section>
            <div style={{ marginBottom: "22px" }}>
              <h1
                style={{
                  fontSize: "48px",
                  marginBottom: "8px",
                  fontWeight: 800,
                  textTransform: "capitalize",
                  color: "#f8fafc",
                }}
              >
                {formatLabel(serie)}
              </h1>

              <p
                style={{
                  color: "#7dd3fc",
                  fontSize: "16px",
                  margin: 0,
                }}
              >
                Click a character to open packs
              </p>
            </div>

            <section style={{ marginBottom: "28px" }}>
              <div
                ref={wrapperRef}
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
            onClick={() => setIsOpen((prev) => !prev)}
            onMouseEnter={(e) => {
             e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 18px 38px rgba(0,0,0,0.28)";
          }}

            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 12px 26px rgba(0,0,0,0.20)";
          }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 18px",
              borderRadius: "18px",
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
              color: "#f8fafc",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 12px 26px rgba(0,0,0,0.20)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              transition: "all 0.2s ease",
            }}
          >
                  <span>⚙️</span>
                  <span>Filters</span>

                  {activeFiltersCount > 0 && (
                    <span
                      style={{
                        minWidth: "22px",
                        height: "22px",
                        padding: "0 6px",
                        borderRadius: "999px",
                        background: "#60a5fa",
                        color: "white",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 800,
                      }}
                    >
                      {activeFiltersCount}
                    </span>
                  )}

                  <span>{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 12px)",
                      right: 0,
                      width: "min(560px, 92vw)",
                      padding: "20px",
                      borderRadius: "22px",
                      background:
                        "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(10,18,30,0.94))",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 24px 60px rgba(0,0,0,0.38)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      zIndex: 30,
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "12px", marginBottom: "8px", color: "#94a3b8" }}>
                        LANGUAGE
                      </div>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {chip(draftLanguage === "all", "All", () => setDraftLanguage("all"))}
                        {chip(draftLanguage === "br", "BR", () => setDraftLanguage("br"))}
                        {chip(draftLanguage === "jp", "JP", () => setDraftLanguage("jp"))}
                        {chip(draftLanguage === "us", "US", () => setDraftLanguage("us"))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "12px", marginBottom: "8px", color: "#94a3b8" }}>
                        QUALITY
                      </div>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {chip(draftQuality === "all", "All", () => setDraftQuality("all"))}
                        {chip(draftQuality === "4k", "4K", () => setDraftQuality("4k"))}
                        {chip(draftQuality === "1080p", "1080p", () => setDraftQuality("1080p"))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "12px", marginBottom: "8px", color: "#94a3b8" }}>
                        STYLE
                      </div>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {chip(draftStyle === "all", "All", () => setDraftStyle("all"))}
                        {chip(draftStyle === "best-scenes", "Best Scenes", () => setDraftStyle("best-scenes"))}
                        {chip(draftStyle === "all-scenes", "All Scenes", () => setDraftStyle("all-scenes"))}
                        {chip(draftStyle === "todas-as-cenas", "Todas As Cenas", () => setDraftStyle("todas-as-cenas"))}
                        {chip(draftStyle === "melhores-cenas", "Melhores Cenas", () => setDraftStyle("melhores-cenas"))}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={clearAll}
                        style={{
                          padding: "12px 18px",
                          borderRadius: "14px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.04)",
                          color: "#f8fafc",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Clear All
                      </button>

                      <button
                        onClick={applyFilters}
                        style={{
                          padding: "12px 18px",
                          borderRadius: "14px",
                          border: "1px solid rgba(96,165,250,0.28)",
                          background: "#60a5fa",
                          color: "white",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {totalCharacters === 0 ? (
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  padding: "20px",
                  color: "#aab3c5",
                }}
              >
                No characters found for this series with these filters.
              </div>
            ) : (
              <SeriesCharactersAccordion grouped={visibleGrouped} />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}