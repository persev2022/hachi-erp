interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
}

export function SimpleBarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-20 truncate">{item.label}</span>
          <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((item.value / max) * 100)}%`,
                backgroundColor: item.color || "#0D9488",
              }}
            />
          </div>
          <span className="text-xs font-medium text-foreground w-8 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
