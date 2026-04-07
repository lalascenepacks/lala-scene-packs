"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchItem = {
  type: "anime" | "series" | "movie" | "character";
  title: string;
  subtitle?: string;
  href: string;
  image: string;
  character?: string;
  aliases?: string[];
};

const RECENT_SEARCHES_KEY = "lala_recent_searches";
const MAX_RECENT_SEARCHES = 8;

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getItemTypeLabel(type: SearchItem["type"]) {
  if (type === "anime") return "Anime";
  if (type === "series") return "Series";
  if (type === "movie") return "Movie";
  return "Character";
}

function getScore(item: SearchItem, query: string) {
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

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "ig");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={`${part}-${index}`}
        style={{
          background: "rgba(96,165,250,0.22)",
          color: "#ffffff",
          padding: "0 2px",
          borderRadius: "4px",
        }}
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

export default function TopSearch({
  items,
}: {
  items: SearchItem[];
}) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch {}
  }, [mounted]);

  function saveRecentSearch(value: string) {
    const clean = value.trim();
    if (!clean) return;

    setRecentSearches((prev) => {
      const next = [
        clean,
        ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES);

      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  }

  function removeRecentSearch(value: string) {
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== value);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  }

  function clearRecentSearches() {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  }

  const results = useMemo(() => {
    const value = normalize(query);

    if (!value) return [];

    return [...items]
      .map((item) => ({
        ...item,
        score: getScore(item, value),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, 8);
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, isFocused]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showDropdown = isFocused && (!!query.trim() || recentSearches.length > 0);
  const hasQuery = !!query.trim();
  const viewAllHref = `/search?q=${encodeURIComponent(query.trim())}`;

  if (!mounted) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          height: "42px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "#1a1a22",
        }}
      />
    );
  }

  return (
    <div
      ref={wrapperRef}
      translate="no"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "420px",
      }}
    >
      <div style={{ position: "relative", width: "100%" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "16px",
            height: "16px",
            color: "#9ca3af",
            pointerEvents: "none",
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (!showDropdown) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (!hasQuery || results.length === 0) return;
              setSelectedIndex((prev) =>
                prev < results.length ? prev + 1 : results.length
              );
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              if (!hasQuery || results.length === 0) return;
              setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            }

            if (e.key === "Escape") {
              setIsFocused(false);
              setSelectedIndex(-1);
            }

            if (e.key === "Enter") {
              const clean = query.trim();
              if (!clean) return;

              saveRecentSearch(clean);

              if (selectedIndex >= 0 && selectedIndex < results.length) {
                const selected = results[selectedIndex];
                window.location.href = selected.character
                  ? `${selected.href}#${selected.character}`
                  : selected.href;
                return;
              }

              window.location.href = viewAllHref;
            }
          }}
          placeholder="Search characters, anime, series, movies..."
          translate="no"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          suppressHydrationWarning
          style={{
            width: "100%",
            padding: "11px 14px 11px 36px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "#1a1a22",
            color: "white",
            outline: "none",
            fontSize: "14px",
          }}
        />
      </div>

      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "#11131a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
            zIndex: 999,
          }}
        >
          {!hasQuery ? (
            <>
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom:
                    recentSearches.length > 0
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    fontWeight: 700,
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                  }}
                >
                  Recent Searches
                </div>

                {recentSearches.length > 0 && (
                  <button
                    onClick={clearRecentSearches}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#93c5fd",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {recentSearches.length === 0 ? (
                <div
                  style={{
                    padding: "14px",
                    color: "#94a3b8",
                    fontSize: "14px",
                  }}
                >
                  No recent searches yet.
                </div>
              ) : (
                recentSearches.map((recent, index) => (
                  <button
                    key={`${recent}-${index}`}
                    onClick={() => {
                      setQuery(recent);
                      setIsFocused(true);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "12px 14px",
                      background: "transparent",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      textAlign: "left",
                      borderBottom:
                        index !== recentSearches.length - 1
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {recent}
                      </span>
                    </div>

                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(recent);
                      }}
                      style={{
                        color: "#94a3b8",
                        fontSize: "14px",
                        padding: "4px 6px",
                        borderRadius: "8px",
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </span>
                  </button>
                ))
              )}
            </>
          ) : results.length === 0 ? (
            <>
              <div
                style={{
                  padding: "14px",
                  color: "#94a3b8",
                  fontSize: "14px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                No results found.
              </div>

              <Link
                href={viewAllHref}
                onClick={() => {
                  saveRecentSearch(query);
                  setQuery("");
                  setIsFocused(false);
                }}
                style={{
                  display: "block",
                  padding: "12px 14px",
                  color: "#93c5fd",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                View all results for "{query}"
              </Link>
            </>
          ) : (
            <>
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  fontSize: "12px",
                  color: "#94a3b8",
                  fontWeight: 700,
                  letterSpacing: "0.4px",
                  textTransform: "uppercase",
                }}
              >
                Results
              </div>

              {results.map((item, index) => {
                const href = item.character
                  ? `${item.href}#${item.character}`
                  : item.href;

                const isSelected = selectedIndex === index;

                return (
                  <Link
                    key={`${item.type}-${item.href}-${index}`}
                    href={href}
                    onClick={() => {
                      saveRecentSearch(query);
                      setQuery("");
                      setIsFocused(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      textDecoration: "none",
                      color: "white",
                      borderBottom:
                        index !== results.length - 1
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "none",
                      background: isSelected
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: "48px",
                        height: "64px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        flexShrink: 0,
                      }}
                    />

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {highlightText(item.title, query)}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          marginTop: "4px",
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>{item.subtitle || getItemTypeLabel(item.type)}</span>
                        <span>•</span>
                        <span>{getItemTypeLabel(item.type)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              <Link
                href={viewAllHref}
                onClick={() => {
                  saveRecentSearch(query);
                  setQuery("");
                  setIsFocused(false);
                }}
                style={{
                  display: "block",
                  padding: "12px 14px",
                  color: "#93c5fd",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 700,
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                View all results for "{query}"
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}