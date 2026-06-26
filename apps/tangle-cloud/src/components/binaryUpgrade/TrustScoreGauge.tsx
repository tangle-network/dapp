import type { FC } from 'react';
import {
  AttestationKind,
  type TrustScoreBreakdown,
} from '@tangle-network/tangle-shared-ui/blueprintApps/trustScore';
import { twMerge } from 'tailwind-merge';

/**
 * Horizontal trust-score gauge.
 *
 * Color band:
 *   ≥ 80 → green-ish (high trust)
 *   ≥ 50 → amber (moderate)
 *   <  50 → muted red (low / no signal)
 *
 * The footer is a one-line breakdown ("3 audits · 1 fuzz · no high findings")
 * so a glance gives the user both a number and a qualitative summary.
 */

type Variant = 'default' | 'compact';

const gaugeColor = (score: number, hasCritical: boolean) => {
  if (hasCritical) return 'hsl(0 78% 60%)';
  if (score >= 80) return 'hsl(150 64% 50%)';
  if (score >= 50) return 'hsl(38 90% 56%)';
  if (score > 0) return 'hsl(20 78% 56%)';
  return 'hsl(220 12% 50%)';
};

const buildBreakdownLine = (breakdown: TrustScoreBreakdown): string => {
  const parts: string[] = [];
  const kindCounts = breakdown.kindBreakdown;
  if (kindCounts[AttestationKind.AUDIT] > 0) {
    parts.push(
      `${kindCounts[AttestationKind.AUDIT]} audit${kindCounts[AttestationKind.AUDIT] === 1 ? '' : 's'}`,
    );
  }
  if (kindCounts[AttestationKind.FORMAL] > 0) {
    parts.push(`${kindCounts[AttestationKind.FORMAL]} formal`);
  }
  if (kindCounts[AttestationKind.FUZZ] > 0) {
    parts.push(`${kindCounts[AttestationKind.FUZZ]} fuzz`);
  }
  if (kindCounts[AttestationKind.BUG_BOUNTY] > 0) {
    parts.push(`${kindCounts[AttestationKind.BUG_BOUNTY]} bounty`);
  }
  if (kindCounts[AttestationKind.SELF] > 0) {
    parts.push(`${kindCounts[AttestationKind.SELF]} self`);
  }

  if (parts.length === 0) {
    return 'No attestations';
  }

  parts.push(
    breakdown.hasCriticalFinding
      ? 'high-severity findings present'
      : 'no high findings',
  );

  return parts.join(' · ');
};

interface TrustScoreGaugeProps {
  breakdown: TrustScoreBreakdown;
  variant?: Variant;
  className?: string;
}

export const TrustScoreGauge: FC<TrustScoreGaugeProps> = ({
  breakdown,
  variant = 'default',
  className,
}) => {
  const { score, hasCriticalFinding } = breakdown;
  const color = gaugeColor(score, hasCriticalFinding);
  const widthPercent = Math.max(2, Math.min(100, score));

  if (variant === 'compact') {
    return (
      <div
        className={twMerge(
          'inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs',
          className,
        )}
        style={{
          borderColor: color,
          color,
          backgroundColor: `${color.replace(')', ' / 0.12)')}`,
        }}
        title={buildBreakdownLine(breakdown)}
      >
        <span className="font-semibold">{score}</span>
        <span className="text-[10px] uppercase tracking-wider">trust</span>
      </div>
    );
  }

  return (
    <div className={twMerge('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between">
        <span
          className="font-display font-extrabold text-2xl"
          style={{ color }}
        >
          {score}
          <span className="ml-1 font-display font-semibold text-xs text-mono-100 dark:text-mono-80 uppercase tracking-wider">
            / 100
          </span>
        </span>
        <span className="text-mono-100 dark:text-mono-80 text-xs">
          {breakdown.attestationCount} attestation
          {breakdown.attestationCount === 1 ? '' : 's'}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: 'hsl(220 12% 24% / 0.6)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${widthPercent}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className="text-mono-100 dark:text-mono-80 text-xs">
        {buildBreakdownLine(breakdown)}
      </p>
    </div>
  );
};

export default TrustScoreGauge;
