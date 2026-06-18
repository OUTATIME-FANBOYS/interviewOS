interface ProgressBarProps {
  percentage: number;
  label: string;
  color: string;
}

export function ProgressBar({ percentage, label, color }: ProgressBarProps) {
  return (
    <div className="my-3 flex items-center gap-3">
      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-600 ease-out"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="text-xs text-muted2 whitespace-nowrap">{label}</span>
    </div>
  );
}
