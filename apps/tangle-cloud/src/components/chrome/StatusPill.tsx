import type { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { statusDot, statusPill, type StatusTone } from '../../styles/chrome';

type Props = {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
  /** Optional leading icon (sized 12px). Overrides the auto tone dot. */
  icon?: ReactNode;
  /**
   * Render a small leading tone dot when no `icon` is supplied. Default true.
   * The dot reads the same hue as the pill border so the status is legible at a
   * glance even before the label. `pending` tone pulses softly.
   */
  dot?: boolean;
};

/**
 * Outlined status pill — single tone per status, never filled. The one
 * canonical status badge for the whole console: service / instance / job /
 * operator / payment state, audit state, capacity state.
 *
 * Pair with `statusToneFor(domain, status)` so a domain status maps to a tone
 * in exactly one place:
 *
 *   <StatusPill tone={statusToneFor('service', 'Active')}>Active</StatusPill>
 *
 * **Not** for decoration; a pill should always reflect a model field the
 * operator can act on.
 */
const StatusPill: FC<Props> = ({
  tone = 'neutral',
  children,
  className,
  icon,
  dot = true,
}) => (
  <span
    className={twMerge(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none',
      statusPill[tone],
      className,
    )}
  >
    {icon !== undefined ? (
      <span className="inline-flex h-3 w-3 items-center justify-center">
        {icon}
      </span>
    ) : (
      dot && (
        <span
          aria-hidden
          className={twMerge(
            'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
            statusDot[tone],
            tone === 'pending' && 'animate-pulse',
          )}
        />
      )
    )}
    {children}
  </span>
);

export default StatusPill;
