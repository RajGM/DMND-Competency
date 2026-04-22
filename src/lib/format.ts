export function formatHashrate(hashrateInHs: number | null): string {
  if (!hashrateInHs || hashrateInHs <= 0) {
    return "No data yet";
  }

  const units = ["H/s", "KH/s", "MH/s", "GH/s", "TH/s", "PH/s"];
  let value = hashrateInHs;
  let unitIndex = 0;

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex += 1;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

export function truncateMiddle(value: string, chars = 6): string {
  if (value.length <= chars * 2) {
    return value;
  }
  return `${value.slice(0, chars)}...${value.slice(-chars)}`;
}
