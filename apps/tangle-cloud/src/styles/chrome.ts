/**
 * Tangle Cloud chrome system — single source of truth for page composition.
 *
 * Three rules:
 *   1. Five type roles. No more. (display / section / body / label / mono)
 *   2. Eight semantic colors. Bound to `@tangle-network/brand` underneath.
 *   3. Three header heights, one toolbar height, one tray width. Apply uniformly.
 *
 * Decorative chrome (radial gradients on hero cards, dot-grid backdrops, ramped
 * shadows on filter strips, tinted "sandbox" card variants outside the iframe
 * surface) is deliberately absent. Pages compose <PageHeader>, <PageToolbar>,
 * <FilterTray>, <MetricStrip>, <ResultGrid|ResultList>, <EmptyState>. Nothing
 * else.
 *
 * Tokens are TypeScript constants (not CSS vars) so component authors can
 * compose them in className/style without round-tripping through a custom
 * property — but the values reference the brand CSS vars so theming still
 * works through @tangle-network/brand.
 */

// ── Type roles ───────────────────────────────────────────────────────────────

export const typeRole = {
  /** Page H1. One per page. */
  display:
    'font-display font-extrabold text-3xl sm:text-4xl tracking-[-0.035em] leading-[1.05]',
  /** Section heads, card titles. */
  section:
    'font-display font-semibold text-lg leading-tight tracking-[-0.012em]',
  /** Default body copy. */
  body: 'text-sm leading-relaxed',
  /** Control labels, eyebrows. Always uppercase, always tracked. */
  label:
    'text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground',
  /** Numerals, IDs, hashes, addresses, amounts. */
  mono: 'font-mono text-[13px] tabular-nums',
} as const;

// ── Spacing scale ────────────────────────────────────────────────────────────
// Stick to these. 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.

export const space = {
  pageGutter: 'px-4 md:px-8',
  pageMaxWidth: 'max-w-[1440px]',
  pagePadY: 'pt-6 pb-10',
  sectionGap: 'space-y-6',
  controlGap: 'gap-3',
  inlineGap: 'gap-2',
} as const;

// ── Chrome heights ───────────────────────────────────────────────────────────
// Encode the three header densities and the one toolbar height as Tailwind
// class fragments so a component author writes <PageHeader density="compact"/>
// and gets the right thing without remembering pixels.

export const chromeHeight = {
  headerCompact: 'min-h-[60px] py-3',
  headerDefault: 'min-h-[80px] py-4',
  headerHero: 'min-h-[120px] py-6',
  toolbar: 'h-11', // 44px
  metricStrip: 'min-h-[56px] py-3',
  tray: 'w-[420px]',
} as const;

// ── Status palette ───────────────────────────────────────────────────────────
// Three status tones. Outlined pills only — `border-{color} bg-{color}/8` —
// never filled. One color per status. Used at boundaries (state of a service,
// audit state, capacity state). Never decorative.

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export const statusPill: Record<StatusTone, string> = {
  neutral: 'border border-border bg-transparent text-muted-foreground',
  success:
    'border border-[color:var(--md3-tertiary,#10b981)]/40 bg-[color:var(--md3-tertiary,#10b981)]/8 text-[color:var(--md3-tertiary,#10b981)]',
  warning:
    'border border-[color:var(--md3-warning,#f59e0b)]/40 bg-[color:var(--md3-warning,#f59e0b)]/8 text-[color:var(--md3-warning,#f59e0b)]',
  danger:
    'border border-[color:var(--md3-error,#ef4444)]/40 bg-[color:var(--md3-error,#ef4444)]/8 text-[color:var(--md3-error,#ef4444)]',
  info: 'border border-[color:var(--border-accent)] bg-[var(--accent-surface-soft)] text-foreground',
} as const;

// ── Surface roles ────────────────────────────────────────────────────────────
// Eight roles. Bound to brand tokens. Anything not in this list is a bug.

export const surface = {
  bgDefault: 'bg-background',
  bgElevated: 'bg-[color:var(--bg-card)]',
  bgSubtle: 'bg-[color:var(--bg-elevated)]/40',
  fgDefault: 'text-foreground',
  fgMuted: 'text-muted-foreground',
  fgSubtle: 'text-foreground/60',
  borderDefault: 'border border-border',
  borderAccent: 'border border-[color:var(--border-accent)]',
} as const;

// ── Focus + interaction ──────────────────────────────────────────────────────

export const focus = {
  ring: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--border-accent-hover)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
} as const;
