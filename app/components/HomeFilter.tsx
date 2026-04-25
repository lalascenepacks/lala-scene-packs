"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HomeCard from "./HomeCard";

type HomeItem = {
  name: string;
  href: string;
  cover: string;
  mp4Count: number;
  scenePacksCount: number;
  type: "anime" | "series" | "movie";
  latestUpdatedAt: number;
  flags: {
    is4k: boolean;
    is1080p: boolean;
    isBR: boolean;
    isJP: boolean;
    isUS: boolean;
    isBestScenes: boolean;
    isMelhoresCenas: boolean;
    isAllScenes: boolean;
    isTodasAsCenas: boolean;
  };
};

type SectionData = {
  title: string;
  items: HomeItem[];
};

export default function HomeFilter({
  allItems,
  sections,
}: {
  allItems: HomeItem[];
  sections: SectionData[];
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const [draftMainFilter, setDraftMainFilter] = useState<
    "all" | "recents" | "anime" | "movie" | "series"
  >("all");

  const [draftQualityFilter, setDraftQualityFilter] = useState<
    "all" | "4k" | "1080p"
  >("all");

  const [draftLanguageFilter, setDraftLanguageFilter] = useState<
    "all" | "br" | "jp" | "us"
  >("all");

  const [draftStyleFilter, setDraftStyleFilter] = useState<
    "all" | "best-scenes" | "melhores-cenas" | "all-scenes" | "todas-as-cenas"
  >("all");

  const [mainFilter, setMainFilter] = useState<
    "all" | "recents" | "anime" | "movie" | "series"
  >("all");

  const [qualityFilter, setQualityFilter] = useState<"all" | "4k" | "1080p">(
    "all"
  );

  const [languageFilter, setLanguageFilter] = useState<
    "all" | "br" | "jp" | "us"
  >("all");

  const [styleFilter, setStyleFilter] = useState<
    "all" | "best-scenes" | "melhores-cenas" | "all-scenes" | "todas-as-cenas"
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

  const hasActiveFilters =
    mainFilter !== "all" ||
    qualityFilter !== "all" ||
    languageFilter !== "all" ||
    styleFilter !== "all";

  const activeFiltersCount = [
    mainFilter !== "all",
    qualityFilter !== "all",
    languageFilter !== "all",
    styleFilter !== "all",
  ].filter(Boolean).length;

  const filteredItems = useMemo(() => {
    let result = [...allItems];

    if (mainFilter === "anime") {
      result = result.filter((item) => item.type === "anime");
    } else if (mainFilter === "movie") {
      result = result.filter((item) => item.type === "movie");
    } else if (mainFilter === "series") {
      result = result.filter((item) => item.type === "series");
    }

    if (qualityFilter === "4k") {
      result = result.filter((item) => item.flags.is4k);
    } else if (qualityFilter === "1080p") {
      result = result.filter((item) => item.flags.is1080p);
    }

    if (languageFilter === "br") {
      result = result.filter((item) => item.flags.isBR);
    } else if (languageFilter === "jp") {
      result = result.filter((item) => item.flags.isJP);
    } else if (languageFilter === "us") {
      result = result.filter((item) => item.flags.isUS);
    }

    if (styleFilter === "best-scenes") {
      result = result.filter((item) => item.flags.isBestScenes);
    } else if (styleFilter === "melhores-cenas") {
      result = result.filter((item) => item.flags.isMelhoresCenas);
    } else if (styleFilter === "all-scenes") {
      result = result.filter((item) => item.flags.isAllScenes);
    } else if (styleFilter === "todas-as-cenas") {
      result = result.filter((item) => item.flags.isTodasAsCenas);
    }

    if (mainFilter === "recents") {
      result.sort((a, b) => b.latestUpdatedAt - a.latestUpdatedAt);
    }

    return result;
  }, [allItems, mainFilter, qualityFilter, languageFilter, styleFilter]);

  function applyFilters() {
    setMainFilter(draftMainFilter);
    setQualityFilter(draftQualityFilter);
    setLanguageFilter(draftLanguageFilter);
    setStyleFilter(draftStyleFilter);
    setIsOpen(false);
  }

  function clearAll() {
    setDraftMainFilter("all");
    setDraftQualityFilter("all");
    setDraftLanguageFilter("all");
    setDraftStyleFilter("all");

    setMainFilter("all");
    setQualityFilter("all");
    setLanguageFilter("all");
    setStyleFilter("all");
    setIsOpen(false);
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

  function renderCard(item: HomeItem) {
  return (
    <HomeCard
      key={`${item.type}-${item.name}`}
      item={item}
      width="220px"
      height="320px"
    />
  );
}

  return (
    <section
      style={{
        marginTop: "-54px",
        marginBottom: "54px",
        position: "relative",
      }}
    >
      <div
        className="filterTopBarResponsive"
        style={{
          position: "absolute",
          top: "40px",
          right: "0px",
          zIndex: 40,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          ref={wrapperRef}
          style={{
            position: "relative",
            pointerEvents: "auto",
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

          {activeFiltersCount > 0 && (
            <div
              style={{
                marginTop: "8px",
                textAlign: "right",
                fontSize: "12px",
                color: "#94a3b8",
              }}
            >
              {activeFiltersCount} active filter
              {activeFiltersCount !== 1 ? "s" : ""}
            </div>
          )}

          {isOpen && (
  <div
    className="homeFilterPanel"
    style={{
      position: "fixed",
      top: "150px",
      left: "12px",
      right: "12px",
      width: "auto",
      maxHeight: "70vh",
      overflowY: "auto",
      overflowX: "hidden",
      boxSizing: "border-box",
      padding: "20px",
      borderRadius: "22px",
      background:
        "linear-gradient(180deg, rgba(14,18,28,0.98), rgba(10,14,22,0.96))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 26px 60px rgba(0,0,0,0.42)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      zIndex: 999,
      animation: "filterPanelIn 0.22s ease-out",
    }}
  >
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "11px",
                    marginBottom: "10px",
                    letterSpacing: "0.8px",
                    fontWeight: 700,
                  }}
                >
                  TYPE
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {chip(draftMainFilter === "all", "All", () =>
                    setDraftMainFilter("all")
                  )}
                  {chip(draftMainFilter === "recents", "Recents", () =>
                    setDraftMainFilter("recents")
                  )}
                  {chip(draftMainFilter === "anime", "Animes", () =>
                    setDraftMainFilter("anime")
                  )}
                  {chip(draftMainFilter === "movie", "Filmes", () =>
                    setDraftMainFilter("movie")
                  )}
                  {chip(draftMainFilter === "series", "Séries", () =>
                    setDraftMainFilter("series")
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "11px",
                    marginBottom: "10px",
                    letterSpacing: "0.8px",
                    fontWeight: 700,
                  }}
                >
                  QUALITY
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {chip(draftQualityFilter === "all", "All Qualities", () =>
                    setDraftQualityFilter("all")
                  )}
                  {chip(draftQualityFilter === "4k", "4K", () =>
                    setDraftQualityFilter("4k")
                  )}
                  {chip(draftQualityFilter === "1080p", "1080p", () =>
                    setDraftQualityFilter("1080p")
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "11px",
                    marginBottom: "10px",
                    letterSpacing: "0.8px",
                    fontWeight: 700,
                  }}
                >
                  LANGUAGE
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {chip(draftLanguageFilter === "all", "All Languages", () =>
                    setDraftLanguageFilter("all")
                  )}
                  {chip(draftLanguageFilter === "br", "BR", () =>
                    setDraftLanguageFilter("br")
                  )}
                  {chip(draftLanguageFilter === "jp", "JP", () =>
                    setDraftLanguageFilter("jp")
                  )}
                  {chip(draftLanguageFilter === "us", "US", () =>
                    setDraftLanguageFilter("us")
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "11px",
                    marginBottom: "10px",
                    letterSpacing: "0.8px",
                    fontWeight: 700,
                  }}
                >
                  STYLE
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {chip(draftStyleFilter === "all", "All Styles", () =>
                    setDraftStyleFilter("all")
                  )}
                  {chip(draftStyleFilter === "best-scenes", "Best Scenes", () =>
                    setDraftStyleFilter("best-scenes")
                  )}
                  {chip(
                    draftStyleFilter === "melhores-cenas",
                    "Melhores Cenas",
                    () => setDraftStyleFilter("melhores-cenas")
                  )}
                  {chip(draftStyleFilter === "all-scenes", "All Scenes", () =>
                    setDraftStyleFilter("all-scenes")
                  )}
                  {chip(
                    draftStyleFilter === "todas-as-cenas",
                    "Todas as Cenas",
                    () => setDraftStyleFilter("todas-as-cenas")
                  )}
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
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.12)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.10)";
  }}
  style={{
    padding: "12px 18px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#f8fafc",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 3px 8px rgba(0,0,0,0.10)",
    transition: "all 0.18s ease",
  }}
>
  Clear All
</button>

<button
  onClick={applyFilters}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow =
      "0 6px 14px rgba(59,130,246,0.18)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow =
      "0 4px 10px rgba(59,130,246,0.14)";
  }}
  style={{
    padding: "12px 18px",
    borderRadius: "14px",
    border: "1px solid rgba(96,165,250,0.24)",
    background: "#60a5fa",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(59,130,246,0.14)",
    transition: "all 0.18s ease",
  }}
>
  Apply Filters
</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!hasActiveFilters ? (
        <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "56px",
  }}
>
  {sections.map((section) => (
    <section key={section.title}>
      <h2
        style={{
          fontSize: "28px",
          marginBottom: "20px",
          fontWeight: 800,
          color: "#f8fafc",
        }}
      >
        {section.title}
      </h2>

      <div className="homeCardsGrid">
        {section.items.map((item) => renderCard(item))}
      </div>
    </section>
  ))}
</div>
      ) : (
        <div>
          <div
            style={{
              color: "#94a3b8",
              fontSize: "14px",
              marginBottom: "18px",
            }}
          >
            {filteredItems.length} results
          </div>

          <div className="homeCardsGrid">
            {filteredItems.map((item) => renderCard(item))}
          </div>

          {filteredItems.length === 0 && (
            <div
              style={{
                marginTop: "18px",
                padding: "18px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#94a3b8",
              }}
            >
              No items found with these filters.
            </div>
          )}
        </div>
      )}
    </section>
  );
}