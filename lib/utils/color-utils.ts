export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]
      : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function lighten(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  let r = parseInt(clean.substring(0, 2), 16);
  let g = parseInt(clean.substring(2, 4), 16);
  let b = parseInt(clean.substring(4, 6), 16);
  r = Math.min(255, r + Math.round(percent * 2.55));
  g = Math.min(255, g + Math.round(percent * 2.55));
  b = Math.min(255, b + Math.round(percent * 2.55));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function darken(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  let r = parseInt(clean.substring(0, 2), 16);
  let g = parseInt(clean.substring(2, 4), 16);
  let b = parseInt(clean.substring(4, 6), 16);
  r = Math.max(0, r - Math.round(percent * 2.55));
  g = Math.max(0, g - Math.round(percent * 2.55));
  b = Math.max(0, b - Math.round(percent * 2.55));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
