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
      className={`flex items-center gap-1 px-3 py-2 rounded-full border cursor-pointer transition-all duration-150 whitespace-nowrap select-none ${small ? "text-xs" : "text-sm"}`}
      style={{
        backgroundColor: active ? `${color}18` : "transparent",
        borderColor: active ? color : "var(--theme-border)",
        color: active ? color : "var(--theme-muted2)",
      }}
    >
      {icon && <span className="text-lg leading-none">{icon}</span>}
      {label}
    </div>
  );
}
