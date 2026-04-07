"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

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

function formatLabel(name: string) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function HomeCard({
  item,
  width = "200px",
  height = "300px",
  recent = false,
}: {
  item: HomeItem;
  width?: string;
  height?: string;
  recent?: boolean;
}) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!shellRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y / rect.height) - 0.5) * -3.2;
    const rotateY = ((x / rect.width) - 0.5) * 3.2;

    shellRef.current.style.transform = `
      perspective(900px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.02)
    `;
  }

  function handleMouseLeave() {
    if (!shellRef.current) return;

    shellRef.current.style.transform = `
      perspective(900px)
      rotateX(0deg)
      rotateY(0deg)
      scale(1)
    `;
  }

  function goToCard() {
    router.push(item.href);
  }

  function goToLanguage(
    e: React.MouseEvent<HTMLButtonElement>,
    lang: "br" | "jp" | "us"
  ) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`${item.href}?lang=${lang}`);
  }

  return (
    <div
      className="cardHover"
      onClick={goToCard}
      style={{
        width,
        color: "white",
        display: "block",
        borderRadius: "18px",
        overflow: "hidden",
        background: "transparent",
        position: "relative",
        cursor: "pointer",
      }}
    >
      <div
        className="cardFrame"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "relative",
          borderRadius: "18px",
          overflow: "hidden",
          height,
          background: "transparent",
        }}
      >
        <div
          ref={shellRef}
          className={`cardShell ${recent ? "recentHoverCard" : ""}`}
        >
          <img
            src={item.cover}
            alt={item.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              borderRadius: "18px",
            }}
          />
        </div>

        <div className="packsBadge">{item.scenePacksCount}</div>

        <div className="cardMetaHover">
          <div className="cardMetaLanguages">
            {item.flags.isBR && (
  <a
    href={`${item.href}?language=br`}
    className="badge badgeBR"
    onClick={(e) => e.stopPropagation()}
  >
    BR
  </a>
)}

            {item.flags.isJP && (
  <a
    href={`${item.href}?language=jp`}
    className="badge badgeJP"
    onClick={(e) => e.stopPropagation()}
  >
    JP
  </a>
)}

{item.flags.isUS && (
  <a
    href={`${item.href}?language=us`}
    className="badge badgeUS"
    onClick={(e) => e.stopPropagation()}
  >
    US
  </a>
)}
          </div>

          <div className="cardMetaQuality">
            {item.flags.is4k && (
  <a
    href={`${item.href}?quality=4k`}
    className="badge badge4k"
    onClick={(e) => e.stopPropagation()}
  >
    4K
  </a>
)}

{item.flags.is1080p && (
  <a
    href={`${item.href}?quality=1080p`}
    className="badge badge1080"
    onClick={(e) => e.stopPropagation()}
  >
    1080P
  </a>
)}
          </div>
        </div>

        <div className="cardOverlay">
          <div className="viewPacks">View Packs</div>

          <div className="cardBottomInfo">
            <div className="cardBottomTitle">{formatLabel(item.name)}</div>
            <div className="cardBottomMeta">
              {item.scenePacksCount} scenepack
              {item.scenePacksCount !== 1 ? "s" : ""} available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}