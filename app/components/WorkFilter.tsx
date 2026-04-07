"use client";

import { useMemo, useState } from "react";

type WorkItem = {
  name: string;
  cover: string;
  href: string;

  flags: {
    is4k: boolean;
    is1080p: boolean;
    isBR: boolean;
    isJP: boolean;
    isUS: boolean;
    isBestScenes: boolean;
    isAllScenes: boolean;
  };
};

export default function WorkFilter({
  items,
}: {
  items: WorkItem[];
}) {
  const [quality, setQuality] = useState<"all" | "4k" | "1080p">("all");
  const [language, setLanguage] = useState<"all" | "br" | "jp" | "us">("all");
  const [style, setStyle] = useState<"all" | "best-scenes" | "all-scenes">(
    "all"
  );

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (quality === "4k") {
      result = result.filter((item) => item.flags.is4k);
    }

    if (quality === "1080p") {
      result = result.filter((item) => item.flags.is1080p);
    }

    if (language === "br") {
      result = result.filter((item) => item.flags.isBR);
    }

    if (language === "jp") {
      result = result.filter((item) => item.flags.isJP);
    }

    if (language === "us") {
      result = result.filter((item) => item.flags.isUS);
    }

    if (style === "best-scenes") {
      result = result.filter((item) => item.flags.isBestScenes);
    }

    if (style === "all-scenes") {
      result = result.filter((item) => item.flags.isAllScenes);
    }

    return result;
  }, [items, quality, language, style]);

  function chip(
    active: boolean,
    label: string,
    onClick: () => void
  ) {
    return (
      <button
        onClick={onClick}
        style={{
          padding: "8px 14px",
          borderRadius: "12px",
          border: active
            ? "1px solid rgba(96,165,250,0.55)"
            : "1px solid rgba(255,255,255,0.08)",
          background: active
            ? "rgba(96,165,250,0.16)"
            : "rgba(255,255,255,0.04)",
          color: active ? "#dbeafe" : "#e2e8f0",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <section style={{ marginTop: "40px" }}>
      <div
        style={{
          marginBottom: "30px",
          padding: "18px",
          borderRadius: "18px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* LANGUAGE */}
        <div>
          <div
            style={{
              fontSize: "12px",
              marginBottom: "8px",
              color: "#94a3b8",
            }}
          >
            LANGUAGE
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {chip(language === "all", "All", () => setLanguage("all"))}
            {chip(language === "br", "BR", () => setLanguage("br"))}
            {chip(language === "jp", "JP", () => setLanguage("jp"))}
            {chip(language === "us", "US", () => setLanguage("us"))}
          </div>
        </div>

        {/* QUALITY */}
        <div>
          <div
            style={{
              fontSize: "12px",
              marginBottom: "8px",
              color: "#94a3b8",
            }}
          >
            QUALITY
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {chip(quality === "all", "All", () => setQuality("all"))}
            {chip(quality === "4k", "4K", () => setQuality("4k"))}
            {chip(quality === "1080p", "1080p", () => setQuality("1080p"))}
          </div>
        </div>

        {/* STYLE */}
        <div>
          <div
            style={{
              fontSize: "12px",
              marginBottom: "8px",
              color: "#94a3b8",
            }}
          >
            STYLE
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {chip(style === "all", "All", () => setStyle("all"))}
            {chip(style === "best-scenes", "Best Scenes", () =>
              setStyle("best-scenes")
            )}
            {chip(style === "all-scenes", "All Scenes", () =>
              setStyle("all-scenes")
            )}
          </div>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="homeCardsGrid">
        {filteredItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            style={{
              width: "220px",
              textDecoration: "none",
              color: "white",
              display: "block",
            }}
          >
            <img
              src={item.cover}
              style={{
                width: "100%",
                height: "320px",
                objectFit: "cover",
                borderRadius: "18px",
              }}
            />
          </a>
        ))}
      </div>
    </section>
  );
}