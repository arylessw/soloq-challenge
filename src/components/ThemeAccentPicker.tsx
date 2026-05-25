"use client";

import { useSiteTheme } from "@/components/SiteThemeProvider";
import { SITE_THEMES } from "@/lib/site-themes";
import type { SiteThemeId } from "@/lib/site-themes";

export function ThemeAccentPicker() {
  const { theme, setTheme } = useSiteTheme();

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Accent du site">
      <span className="text-muted/80 shrink-0">Accent</span>
      <div className="flex gap-1.5">
        {SITE_THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            aria-label={t.label}
            aria-pressed={theme === t.id}
            onClick={() => setTheme(t.id as SiteThemeId)}
            className={`h-6 w-6 rounded-full border-2 transition ${
              theme === t.id
                ? "border-white scale-110"
                : "border-white/20 hover:border-white/50"
            }`}
            style={{ backgroundColor: t.swatch }}
          />
        ))}
      </div>
    </div>
  );
}
