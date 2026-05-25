export type SiteThemeId =
  | "gold"
  | "emerald"
  | "cyan"
  | "violet"
  | "rose";

export const SITE_THEMES: Array<{
  id: SiteThemeId;
  label: string;
  swatch: string;
}> = [
  { id: "gold", label: "Or", swatch: "#d4af37" },
  { id: "emerald", label: "Émeraude", swatch: "#34d399" },
  { id: "cyan", label: "Cyan", swatch: "#22d3ee" },
  { id: "violet", label: "Violet", swatch: "#a78bfa" },
  { id: "rose", label: "Rose", swatch: "#fb7185" },
];

export const THEME_STORAGE_KEY = "soloq-site-theme";

export function isSiteThemeId(v: string): v is SiteThemeId {
  return SITE_THEMES.some((t) => t.id === v);
}
