import type { CSSProperties } from 'react';

/**
 * Stable HSL hue per known blueprint category. Categories rendered to users
 * (`Inference`, `Training`, `Agents`, `Data`, `Trading`, `Other`, plus the
 * legacy `Blueprint` fallback) get a fixed color so the catalog reads as
 * categorized rather than monochrome. Anything not in the map hashes its
 * label into the [0, 360) range, deterministically.
 */
const CATEGORY_HUE: Record<string, number> = {
  Inference: 210,
  'AI Inference': 210,
  Training: 160,
  'AI Training': 160,
  Agents: 265,
  Data: 195,
  Trading: 38,
  Other: 240,
  Blueprint: 240,
};

export const categoryHue = (category: string | null | undefined): number => {
  if (!category) return CATEGORY_HUE.Other;
  if (category in CATEGORY_HUE) return CATEGORY_HUE[category];

  let hash = 0;
  for (let i = 0; i < category.length; i += 1) {
    hash = (hash * 31 + category.charCodeAt(i)) % 360;
  }
  return hash;
};

export type CategoryPalette = {
  hue: number;
  bg: string;
  border: string;
  text: string;
  stripe: string;
  swatch: string;
};

export const categoryPalette = (
  category: string | null | undefined,
): CategoryPalette => {
  const hue = categoryHue(category);
  return {
    hue,
    bg: `hsl(${hue} 70% 50% / 0.14)`,
    border: `hsl(${hue} 70% 62% / 0.34)`,
    text: `hsl(${hue} 90% 78%)`,
    stripe: `hsl(${hue} 70% 60% / 0.55)`,
    swatch: `hsl(${hue} 60% 16%)`,
  };
};

export const categoryBadgeStyle = (
  category: string | null | undefined,
): CSSProperties => {
  const palette = categoryPalette(category);
  return {
    backgroundColor: palette.bg,
    borderColor: palette.border,
    color: palette.text,
  };
};

export const categoryStripeStyle = (
  category: string | null | undefined,
): CSSProperties => {
  const palette = categoryPalette(category);
  return {
    boxShadow: `inset 0 2px 0 ${palette.stripe}`,
  };
};
