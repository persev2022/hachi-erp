interface StatRingProps {
  value: number; // 0-100 percentage
  label: string;
  color?: string;
  size?: number;
}

export function StatRing({ value, label, color = "#0D9488", size = 80 }: StatRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="text-lg font-bold" style={{ color }}>
        {value}%
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
