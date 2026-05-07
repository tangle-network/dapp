/**
 * Tangle Cloud canonical Text component.
 *
 * Single source of truth for the type ramp across tangle-cloud. Consumes the
 * `@tangle-network/brand` 0.3 token system: `--font-sans`, `--font-display`,
 * `--font-size-*`, `--line-height-*`, plus the Tailwind-mapped `text-foreground`
 * / `text-muted-foreground` colors driven by the brand HSL bridge.
 *
 * Replaces ~13 per-page `Text` shims that all reimplemented the same ramp with
 * subtly different variant unions ('h4' | 'h5' | 'body1' | 'body2' | 'body3' |
 * 'body4'). The new variant union mirrors brand vocabulary; legacy variant names
 * are accepted as aliases for backwards compatibility, so existing call sites
 * keep type-checking.
 */
import type { ComponentProps, ElementType, FC } from 'react';

/**
 * Brand-aligned variants. Mapping rationale:
 *
 *   - `h1`  → 4xl display (page hero)
 *   - `h2`  → 3xl display (section heading; replaces legacy `h4`)
 *   - `h3`  → xl display (sub-section; replaces legacy `h5`)
 *   - `h4`  → lg display
 *   - `body-lg`  → text-base (replaces legacy `body1`)
 *   - `body`     → text-sm  (replaces legacy `body2`, the default)
 *   - `body-sm`  → text-xs  (replaces legacy `body3` / `body4`)
 *   - `caption`  → text-[11px] muted (timestamps, meta)
 *
 * Legacy aliases ('h4', 'h5', 'body1', 'body2', 'body3', 'body4') resolve to
 * the same classes the per-page shims used, preserving visual parity.
 */
export type TextVariant =
  // Brand-aligned canonical names
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'caption'
  // Legacy aliases — kept so existing call sites continue to type-check.
  // Map: 'h4' → 'h2' (display 3xl), 'h5' → 'h3' (display xl),
  // 'body1' → 'body-lg', 'body2' → 'body', 'body3' / 'body4' → 'body-sm'.
  | 'h5'
  | 'body1'
  | 'body2'
  | 'body3'
  | 'body4';

export type TextProps = ComponentProps<'p'> & {
  variant?: TextVariant;
  fw?: 'bold' | 'semibold';
  /** Override the rendered semantic element. Defaults are sensible per variant. */
  as?: ElementType;
};

/**
 * Maps a (possibly legacy) variant to the canonical token set. We resolve once
 * here so both `defaultElementFor` and `classFor` work off canonical names.
 */
const canonicalize = (
  variant: TextVariant,
): Exclude<TextVariant, 'h5' | 'body1' | 'body2' | 'body3' | 'body4'> => {
  switch (variant) {
    case 'h4':
      // Legacy 'h4' was used as a top-level page heading (3xl display).
      // Brand 'h2' is the canonical 3xl display.
      return 'h2';
    case 'h5':
      // Legacy 'h5' was used for section headings (xl display).
      return 'h3';
    case 'body1':
      return 'body-lg';
    case 'body2':
      return 'body';
    case 'body3':
    case 'body4':
      return 'body-sm';
    default:
      return variant;
  }
};

const defaultElementFor = (
  variant: ReturnType<typeof canonicalize>,
): ElementType => {
  switch (variant) {
    case 'h1':
      return 'h1';
    case 'h2':
      return 'h2';
    case 'h3':
      return 'h3';
    case 'h4':
      return 'h4';
    case 'caption':
      return 'span';
    default:
      return 'p';
  }
};

const classFor = (variant: ReturnType<typeof canonicalize>): string => {
  switch (variant) {
    case 'h1':
      return 'font-display text-4xl tracking-tight text-foreground';
    case 'h2':
      return 'font-display text-3xl tracking-tight text-foreground';
    case 'h3':
      return 'font-display text-xl text-foreground';
    case 'h4':
      return 'font-display text-lg text-foreground';
    case 'body-lg':
      return 'text-base text-foreground';
    case 'body':
      return 'text-sm text-foreground';
    case 'body-sm':
      return 'text-xs text-muted-foreground';
    case 'caption':
      return 'text-[11px] text-muted-foreground';
  }
};

export const Text: FC<TextProps> = ({
  variant = 'body',
  fw,
  as,
  className = '',
  ...props
}) => {
  const canonical = canonicalize(variant);
  const Component = (as ?? defaultElementFor(canonical)) as ElementType;
  const variantClass = classFor(canonical);
  const weightClass =
    fw === 'bold' ? 'font-bold' : fw === 'semibold' ? 'font-semibold' : '';

  return (
    <Component
      className={[variantClass, weightClass, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
};
