"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export function Toast({ message, visible, onHide }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, 1800);
    return () => clearTimeout(timer);
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-surface2 border border-border2 rounded-full px-4 py-2 text-sm text-text z-50 animate-fadeUp">
      {message}
    </div>
  );
}
