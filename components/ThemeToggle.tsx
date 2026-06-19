"use client";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "3.25rem",
        height: "1.625rem",
        borderRadius: "9999px",
        padding: "0.1875rem",
        border: "1px solid rgba(255,255,255,0.14)",
        background: dark
          ? "rgba(255,255,255,0.07)"
          : "rgba(0,0,0,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: dark
          ? "inset 0 1px 3px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06)"
          : "inset 0 1px 3px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.8)",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {/* Track icons */}
      <span
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.6rem",
          opacity: dark ? 0.35 : 0,
          transition: "opacity 0.25s",
          userSelect: "none",
        }}
      >
        ☀️
      </span>
      <span
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.6rem",
          opacity: dark ? 0 : 0.35,
          transition: "opacity 0.25s",
          userSelect: "none",
        }}
      >
        🌙
      </span>

      {/* Sliding puck */}
      <div
        style={{
          position: "absolute",
          top: "0.1875rem",
          width: "1.25rem",
          height: "1.25rem",
          borderRadius: "9999px",
          left: dark ? "calc(100% - 1.4375rem)" : "0.1875rem",
          transition: "left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.6rem",
          background: dark
            ? "linear-gradient(145deg, rgba(180,190,255,0.35) 0%, rgba(100,120,220,0.2) 100%)"
            : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(220,228,240,0.9) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: dark
            ? "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)"
            : "0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.04)",
          border: dark
            ? "1px solid rgba(255,255,255,0.15)"
            : "1px solid rgba(0,0,0,0.06)",
          userSelect: "none",
        }}
      >
        {dark ? "🌙" : "☀️"}
      </div>
    </button>
  );
}
