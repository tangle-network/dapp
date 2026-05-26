import type { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { statusPill, type StatusTone } from '../../styles/chrome';

type Props = {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
  /** Optional leading icon (sized 12px). */
  icon?: ReactNode;
};

/**
 * Outlined status pill — single tone per status, never filled. Use for
 * service state, audit state, capacity state, network state. **Not** for
 * decoration; pills should always reflect a model field the operator can act
 * on.
 */
const StatusPill: FC<Props> = ({
  tone = 'neutral',
  children,
  className,
  icon,
}) => (
  <span
    className={twMerge(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none',
      statusPill[tone],
      className,
    )}
  >
    {icon !== undefined && (
      <span className="inline-flex h-3 w-3 items-center justify-center">
        {icon}
      </span>
    )}
    {children}
  </span>
);

export default StatusPill;
