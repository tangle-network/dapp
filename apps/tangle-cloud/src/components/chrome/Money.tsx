import { useCallback, useState, type FC } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  formatMoney,
  type FormatMoneyOptions,
  type MoneyView,
} from '../../styles/chrome';

type Props = {
  /** Exact on-chain value. The component derives a lossless view from it. */
  value: bigint | null | undefined;
  /** Formatting contract — decimals, symbol, compact display. */
  options?: FormatMoneyOptions;
  /** Pre-built view (when the caller already computed one). Overrides `value`. */
  view?: MoneyView;
  /**
   * Show the copy-full-precision affordance. Default true. Disable in extremely
   * dense rows where copy lives elsewhere; the full value is still in `title`.
   */
  copyable?: boolean;
  /** Render the unit/symbol after the number. Default true. */
  showSymbol?: boolean;
  /** Right-align (the default for amounts in tables/ledgers). */
  align?: 'left' | 'right';
  className?: string;
};

/**
 * Canonical money cell. Renders the compact display from a {@link MoneyView},
 * carries the unit, exposes the full-precision value on hover (`title`) and one
 * click away (copy). This is the ONLY way money should render on the console —
 * it makes the on-chain bigint exact, copyable, and auditable, which the brief
 * mandates and the old `parseFloat` formatter violated.
 *
 *   <Money value={escrow.balance} options={{ decimals, symbol: 'TNT' }} />
 *
 * Empty values render an em-dash (never a fake `0`).
 */
const Money: FC<Props> = ({
  value,
  options,
  view,
  copyable = true,
  showSymbol = true,
  align = 'right',
  className,
}) => {
  const money = view ?? formatMoney(value, options);
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(() => {
    if (money.isEmpty) return;
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;

    void navigator.clipboard.writeText(money.full).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  }, [money.full, money.isEmpty]);

  const fullLabel = money.isEmpty
    ? 'No value'
    : `${money.full}${money.symbol ? ` ${money.symbol}` : ''}`;

  return (
    <span
      className={twMerge(
        'inline-flex items-baseline gap-1 font-mono text-sm tabular-nums',
        align === 'right' && 'justify-end',
        className,
      )}
      title={fullLabel}
    >
      <span className="text-mono-200 dark:text-mono-0">{money.display}</span>
      {showSymbol && money.symbol && !money.isEmpty && (
        <span className="text-xs text-mono-100 dark:text-mono-80">
          {money.symbol}
        </span>
      )}
      {copyable && !money.isEmpty && (
        <button
          type="button"
          onClick={onCopy}
          title={`Copy full precision: ${fullLabel}`}
          aria-label={`Copy full precision value ${fullLabel}`}
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-mono-100 dark:text-mono-80/70 transition-colors hover:text-mono-200 dark:text-mono-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--border-accent-hover)]"
        >
          {copied ? <CheckGlyph /> : <CopyGlyph />}
        </button>
      )}
    </span>
  );
};

const CopyGlyph: FC = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden>
    <rect
      x="5.5"
      y="5.5"
      width="7"
      height="7"
      rx="1.2"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M10.5 3.5H4.7c-.66 0-1.2.54-1.2 1.2v5.8"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const CheckGlyph: FC = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden>
    <path
      d="M3.5 8.5l3 3 6-6.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Money;
