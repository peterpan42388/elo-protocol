type SparklineProps = {
  values: number[];
};

function normalize(values: number[]): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((value) => (value - min) / (max - min));
}

export function Sparkline({ values }: SparklineProps) {
  if (!values.length) {
    return <div className="sparkline-empty">No trend data</div>;
  }

  const normalized = normalize(values);
  const points = normalized
    .map((value, index) => {
      const x = (index / Math.max(1, normalized.length - 1)) * 100;
      const y = 100 - value * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="sparkline">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}
