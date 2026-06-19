interface ChipProps {
  label: string;
  active: boolean;
  color: string;
  icon?: string;
  small?: boolean;
  onClick: () => void;
}

export function Chip({ label, active, color, icon, small, onClick }: ChipProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 rounded-full border cursor-pointer transition-all duration-150 whitespace-nowrap select-none font-medium ${small ? "text-xs py-1.5" : "text-sm py-2"}`}
      style={{
        backgroundColor: active ? `${color}18` : "transparent",
        borderColor: active ? color : "var(--theme-border)",
        color: active ? color : "var(--theme-muted2)",
      }}
    >
      {icon && <span className="text-sm leading-none">{icon}</span>}
      {label}
    </div>
  );
}
