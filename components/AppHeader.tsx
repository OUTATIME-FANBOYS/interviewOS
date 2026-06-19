"use client";

import { useTheme } from "@/hooks/useTheme";

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { dark, toggle } = useTheme();

  return (
    <div
      className="sticky top-0 z-10 bg-bg/95 backdrop-blur border-b border-border px-4 pb-3 flex items-center justify-between"
      style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))" }}
    >
      <span className="text-base font-semibold text-text tracking-tight">
        InterviewOS <span className="text-muted2">{title}</span>
      </span>
      <button
        onClick={toggle}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-border text-base transition-colors"
        aria-label="Toggle theme"
      >
        {dark ? "☀️" : "🌙"}
      </button>
    </div>
  );
}
