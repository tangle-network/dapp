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
    'font-display font-extrabold text-3xl sm:text-4xl tracking-normal leading-[1.08]',
  /** Section heads, card titles. */
  section: 'font-display font-semibold text-lg leading-tight tracking-normal',
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
  toolbar: 'min-h-11', // 44px minimum; wraps on narrow screens.
  metricStrip: 'min-h-[56px] py-3',
  tray: 'w-[420px]',
} as const;

// ── Status palette ───────────────────────────────────────────────────────────
// Six status tones, one per *meaning*. Outlined pills only —
// `border-{color} bg-{color}/8` — never filled. One color per status. Used at
// boundaries (state of a service/instance/job/operator/payment, audit state,
// capacity state). Never decorative.
//
// The tone enum is closed on purpose: surfaces map a domain status to one of
// these six and the pill renders identically everywhere. A status can never
// silently collapse to a default (the bug F1-svc: a Chip color map that only
// knew green/red, so blue/purple/yellow all rendered the same neutral pill).
//
// Tone meanings:
//   neutral  — inert / unknown / placeholder (default; no signal)
//   info     — informational, in the accent family (e.g. Fixed membership,
//              EventDriven pricing, an in-band state worth surfacing)
//   success  — healthy / active / live / approved / billable / audited
//   warning  — needs attention / pending action / degraded / stale / not-yet
//   danger   — failed / rejected / slashed / terminated / disputed
//   pending  — in-flight / provisioning / indexing / awaiting confirmation
//              (rendered with a soft pulsing dot by StatusPill)

export type StatusTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'pending';

export const statusPill: Record<StatusTone, string> = {
  neutral: 'border border-border bg-transparent text-muted-foreground',
  info: 'border border-[color:var(--border-accent)] bg-[var(--accent-surface-soft)] text-foreground',
  success:
    'border border-[color:var(--md3-tertiary,#10b981)]/40 bg-[color:var(--md3-tertiary,#10b981)]/8 text-[color:var(--md3-tertiary,#10b981)]',
  warning:
    'border border-[color:var(--md3-warning,#f59e0b)]/40 bg-[color:var(--md3-warning,#f59e0b)]/8 text-[color:var(--md3-warning,#f59e0b)]',
  danger:
    'border border-[color:var(--md3-error,#ef4444)]/40 bg-[color:var(--md3-error,#ef4444)]/8 text-[color:var(--md3-error,#ef4444)]',
  pending:
    'border border-[color:var(--border-accent)] bg-[var(--accent-surface-soft)] text-[color:var(--border-accent-hover)]',
} as const;

// The leading dot color for each tone — kept in sync with `statusPill` so the
// StatusPill auto-dot and any tone-aware indicator read the same hue.
export const statusDot: Record<StatusTone, string> = {
  neutral: 'bg-muted-foreground/40',
  info: 'bg-[color:var(--border-accent-hover)]',
  success: 'bg-[color:var(--md3-tertiary,#10b981)]',
  warning: 'bg-[color:var(--md3-warning,#f59e0b)]',
  danger: 'bg-[color:var(--md3-error,#ef4444)]',
  pending: 'bg-[color:var(--border-accent-hover)]',
} as const;

// ── Canonical domain → tone mapping ──────────────────────────────────────────
// `statusToneFor(domain, status)` is the single place the app decides which
// tone a given domain status earns. Surfaces NEVER hand-roll
// `color === 'green' ? 'success' : …`; they call this. Adding a new status
// value is a one-line edit here, not a sweep across N files.
//
// Each domain maps its *string* status label (the value surfaces already have
// in hand — enum label, indexer field, derived flag) to a tone. Unknown values
// fall through to `neutral`, which is the honest default: no fake signal.

export type StatusDomain =
  | 'service' // service lifecycle: Pending | Active | Terminated
  | 'instance' // instance / request approval: Pending | Approved | Rejected | Active | Terminated
  | 'job' // job execution: Submitted | Running | Completed | Failed
  | 'operator' // operator state: Active | Inactive | Leaving | Slashed
  | 'payment' // payment / pricing model: PayOnce | Subscription | EventDriven
  | 'membership' // membership model: Fixed | Dynamic
  | 'audit' // audit / attestation: Audited | Unaudited | Pending
  | 'availability' // capacity: Available | Limited | Unavailable
  | 'billing'; // subscription billability: Billable | NotBillable | Due | Paid

const TONE_BY_DOMAIN: Record<StatusDomain, Record<string, StatusTone>> = {
  service: {
    pending: 'pending',
    active: 'success',
    terminated: 'danger',
  },
  instance: {
    pending: 'pending',
    approved: 'success',
    active: 'success',
    rejected: 'danger',
    terminated: 'danger',
    indexing: 'pending',
    submitted: 'pending',
  },
  job: {
    submitted: 'pending',
    pending: 'pending',
    running: 'pending',
    completed: 'success',
    succeeded: 'success',
    failed: 'danger',
    errored: 'danger',
  },
  operator: {
    active: 'success',
    online: 'success',
    inactive: 'neutral',
    offline: 'warning',
    leaving: 'warning',
    exiting: 'warning',
    slashed: 'danger',
    disabled: 'danger',
  },
  payment: {
    // Distinct tones so PayOnce / Subscription / EventDriven are never
    // visually identical (the F1-svc collapse). These are *informational*
    // category badges, not health signals — kept in the accent/neutral family.
    payonce: 'info',
    subscription: 'success',
    eventdriven: 'warning',
  },
  membership: {
    // Fixed vs Dynamic must be distinguishable.
    fixed: 'info',
    dynamic: 'success',
  },
  audit: {
    audited: 'success',
    verified: 'success',
    unaudited: 'neutral',
    pending: 'pending',
    failed: 'danger',
  },
  availability: {
    available: 'success',
    limited: 'warning',
    degraded: 'warning',
    unavailable: 'danger',
  },
  billing: {
    billable: 'success',
    due: 'warning',
    notbillable: 'neutral',
    notyet: 'warning',
    paid: 'success',
  },
} as const;

/**
 * Map a domain status to its canonical {@link StatusTone}. Pass the status as a
 * string (enum label, indexer field, or a derived label) plus the domain so the
 * same word can mean different things in different contexts (an `active`
 * service and an `active` operator both read success, but `pending` is a
 * `pending` tone for a service yet there is no such status for membership).
 *
 * Returns `neutral` for any unknown status — the honest default. Matching is
 * case/space/dash-insensitive so `'PayOnce'`, `'pay_once'`, and `'pay once'`
 * all resolve.
 */
export function statusToneFor(
  domain: StatusDomain,
  status: string | number | null | undefined,
): StatusTone {
  if (status === null || status === undefined) return 'neutral';
  const key = String(status)
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
  return TONE_BY_DOMAIN[domain][key] ?? 'neutral';
}

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

// ── Money contract ───────────────────────────────────────────────────────────
// On a money/permissions console the value on screen MUST be the exact on-chain
// bigint, never a lossy float. The bug this kills (F1-acct, F5-svc): bigints
// pushed through `Number(formatUnits(...)).toLocaleString({maxFractionDigits:4})`
// — which silently truncates precision and drops the unit, so an auditor can
// neither trust nor copy the number.
//
// `formatMoney` is a *view* over the exact bigint: it returns a compact display
// string for the cell, the full-precision decimal string for the copy
// affordance, and the unit. The `<Money>` chrome component renders this view
// with a copy-full-precision button. Surfaces format money ONE way: through
// this contract.

export type MoneyView = {
  /** Compact, human display — e.g. `1,234.56` or `1.2M`. Lossy by design; the
   *  cell stays scannable. Never the source of truth. */
  display: string;
  /** Full-precision decimal string — every significant digit the bigint holds.
   *  This is what the copy affordance writes to the clipboard. */
  full: string;
  /** The raw on-chain integer as a string (wei-equivalent), for power users /
   *  debugging. */
  raw: string;
  /** Token symbol / unit. Provenance always travels with the number. */
  symbol: string;
  /** Decimals used to scale `raw` → `full`. */
  decimals: number;
  /** True when the source value was missing — render an em-dash, not `0`. */
  isEmpty: boolean;
};

export type FormatMoneyOptions = {
  /** Token decimals. Default 18. */
  decimals?: number;
  /** Token symbol / unit. Default `''` (caller should always pass one). */
  symbol?: string;
  /** Significant fraction digits in the *compact display* only — `full` is
   *  always complete. Default 4. */
  displayDecimals?: number;
  /** Collapse large magnitudes to K/M/B in the compact display. Default true. */
  compact?: boolean;
};

const EM_DASH = '—';

function trimTrailingZeros(decimalStr: string): string {
  if (!decimalStr.includes('.')) return decimalStr;
  return decimalStr.replace(/\.?0+$/, '');
}

/**
 * Build a {@link MoneyView} from an exact on-chain bigint. Lossless: `full` is
 * derived by integer-only division of the raw value, never by `Number()`.
 *
 *   formatMoney(1234567890000000000n, { decimals: 18, symbol: 'TNT' })
 *   // → { display: '1.2346', full: '1.23456789', raw: '1234567890000000000',
 *   //     symbol: 'TNT', decimals: 18, isEmpty: false }
 */
export function formatMoney(
  value: bigint | null | undefined,
  options: FormatMoneyOptions = {},
): MoneyView {
  const {
    decimals = 18,
    symbol = '',
    displayDecimals = 4,
    compact = true,
  } = options;

  if (value === null || value === undefined) {
    return {
      display: EM_DASH,
      full: EM_DASH,
      raw: '',
      symbol,
      decimals,
      isEmpty: true,
    };
  }

  const negative = value < 0n;
  const abs = negative ? -value : value;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const fraction = abs % base;

  // Lossless full-precision decimal string from integer arithmetic.
  const fractionStr =
    decimals > 0
      ? fraction.toString().padStart(decimals, '0').replace(/0+$/, '')
      : '';
  const full =
    (negative ? '-' : '') +
    (fractionStr.length > 0
      ? `${whole.toString()}.${fractionStr}`
      : whole.toString());

  // Compact display. We round the fractional part to `displayDecimals` for the
  // cell only; the source of truth stays in `full`.
  const wholeNum = whole; // bigint, may exceed Number range
  let display: string;
  if (compact && wholeNum >= 1_000_000n) {
    const units: Array<[bigint, string]> = [
      [1_000_000_000_000n, 'T'],
      [1_000_000_000n, 'B'],
      [1_000_000n, 'M'],
    ];
    const [unitBase, suffix] = units.find(([u]) => wholeNum >= u) ?? [
      1_000_000n,
      'M',
    ];
    // One decimal of the compacted magnitude, integer-only.
    const scaled = (wholeNum * 10n) / unitBase;
    const head = scaled / 10n;
    const tenth = scaled % 10n;
    display =
      (negative ? '-' : '') +
      (tenth > 0n
        ? `${head.toString()}.${tenth.toString()}`
        : head.toString()) +
      suffix;
  } else {
    // wholeNum is < 1e6 here, safe to render with group separators.
    const wholeDisplay = Number(wholeNum).toLocaleString('en-US');
    const roundedFraction =
      displayDecimals > 0 && fractionStr.length > 0
        ? `.${trimTrailingZeros(
            fraction
              .toString()
              .padStart(decimals, '0')
              .slice(0, displayDecimals),
          ).replace(/^\./, '')}`.replace(/\.$/, '')
        : '';
    const fracClean = roundedFraction === '.' ? '' : roundedFraction;
    display = (negative ? '-' : '') + wholeDisplay + fracClean;
  }

  return {
    display: display === '' ? '0' : display,
    full,
    raw: value.toString(),
    symbol,
    decimals,
    isEmpty: false,
  };
}
