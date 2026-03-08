export function formatElo(value: number): string {
  if (!Number.isFinite(value)) return "--";
  return `${value.toFixed(4)} ELO`;
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "--";
  return `${(value * 100).toFixed(1)}%`;
}

export function formatTs(ts: number): string {
  if (!Number.isFinite(ts) || ts <= 0) return "--";
  return new Date(ts).toLocaleString();
}

export function toShortId(value: string, max = 18): string {
  if (!value) return "--";
  if (value.length <= max) return value;
  return `${value.slice(0, Math.floor(max / 2))}...${value.slice(-Math.floor(max / 2))}`;
}
