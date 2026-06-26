import { useCallback, useState, type FC } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {
  /** The full value copied to the clipboard (id, hash, address). */
  value: string | null | undefined;
  /**
   * Display text. Defaults to a middle-truncated form of `value` when it looks
   * like a hash/address (long + hex), otherwise the raw value.
   */
  display?: string;
  /** Middle-truncate hex-looking values to `head…tail`. Default true. */
  truncate?: boolean;
  className?: string;
};

function middleTruncate(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/**
 * Copyable identifier cell — mono, theme-aware, click-to-copy. The canonical
 * way to render an id / tx hash / address inside a table or detail row so the
 * operator can audit and copy the exact value (principle 2: copyable IDs). Long
 * hex values are middle-truncated for scan density; the full value is always in
 * `title` and on the clipboard.
 */
const CopyableId: FC<Props> = ({
  value,
  display,
  truncate = true,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(() => {
    if (!value) return;
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  }, [value]);

  if (!value) {
    return <span className="text-mono-120 dark:text-mono-100">—</span>;
  }

  const looksHex = /^0x[0-9a-fA-F]{8,}$/.test(value);
  const shown =
    display ?? (truncate && looksHex ? middleTruncate(value) : value);

  return (
    <button
      type="button"
      onClick={onCopy}
      title={copied ? 'Copied' : `Copy: ${value}`}
      aria-label={`Copy ${value}`}
      className={twMerge(
        'group inline-flex max-w-full items-center gap-1 font-mono text-sm tabular-nums text-mono-200 dark:text-mono-0 transition-colors hover:text-[color:var(--border-accent-hover)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--border-accent-hover)]',
        className,
      )}
    >
      <span className="truncate">{shown}</span>
      <span
        aria-hidden
        className="shrink-0 text-mono-120 dark:text-mono-100/60 transition-colors group-hover:text-[color:var(--border-accent-hover)]"
      >
        {copied ? (
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden>
            <path
              d="M3.5 8.5l3 3 6-6.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
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
        )}
      </span>
    </button>
  );
};

export default CopyableId;
