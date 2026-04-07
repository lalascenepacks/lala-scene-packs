"use client";

import { useRef } from "react";

export default function HorizontalCarousel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" });
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" });
  }

  return (
    <div style={{ marginBottom: "50px" }}>
      <h2
        style={{
          fontSize: "28px",
          marginBottom: "16px",
          fontWeight: 800,
        }}
      >
        {title}
      </h2>

      <div style={{ position: "relative" }}>
        <button
          onClick={scrollLeft}
          style={{
            position: "absolute",
            left: "-10px",
            top: "40%",
            zIndex: 5,
            background: "rgba(0,0,0,0.6)",
            border: "none",
            color: "white",
            fontSize: "18px",
            padding: "10px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ◀
        </button>

        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: "16px",
            overflowX: "auto",
            scrollBehavior: "smooth",
          }}
        >
          {children}
        </div>

        <button
          onClick={scrollRight}
          style={{
            position: "absolute",
            right: "-10px",
            top: "40%",
            zIndex: 5,
            background: "rgba(0,0,0,0.6)",
            border: "none",
            color: "white",
            fontSize: "18px",
            padding: "10px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}