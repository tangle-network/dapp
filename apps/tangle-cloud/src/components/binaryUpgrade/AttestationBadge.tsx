import type { FC } from 'react';
import { Button } from '@tangle-network/sandbox-ui/primitives';
import {
  type Attestation,
  type AttestationWithAuditor,
  type Auditor,
  AttestationKind,
  AuditorTier,
  attestationKindLabel,
  auditorTierLabel,
  severityLabel,
} from '@tangle-network/tangle-shared-ui/blueprintApps/trustScore';
import { twMerge } from 'tailwind-merge';

/**
 * Single-row presentation of one attestation. Renders:
 *   - Auditor identity (logo placeholder + name) or shortened address
 *   - Tier badge (FIRST_PARTY / INDEPENDENT / COMMUNITY) colored per tier
 *   - Kind chip (AUDIT / FUZZ / FORMAL / BUG_BOUNTY / SELF)
 *   - Severity dot (none → green, info/low → yellow, med → orange, high/critical → red)
 *   - Attested-at relative time + expiry summary
 *   - "Read report" link out to the off-chain URI
 *   - Optional revoke action (shown only for the original attester)
 *
 * If the attestation is revoked, the row gets a strikethrough and a small
 * "(revoked)" label. Expired rows get the same treatment but with an
 * "(expired)" label and the score helper already filters them.
 */

const KIND_PALETTE: Record<
  AttestationKind,
  { bg: string; border: string; text: string }
> = {
  [AttestationKind.AUDIT]: {
    bg: 'hsl(210 80% 50% / 0.16)',
    border: 'hsl(210 70% 62% / 0.5)',
    text: 'hsl(210 90% 80%)',
  },
  [AttestationKind.FORMAL]: {
    bg: 'hsl(265 80% 50% / 0.16)',
    border: 'hsl(265 70% 62% / 0.5)',
    text: 'hsl(265 90% 80%)',
  },
  [AttestationKind.FUZZ]: {
    bg: 'hsl(195 80% 50% / 0.16)',
    border: 'hsl(195 70% 62% / 0.5)',
    text: 'hsl(195 90% 80%)',
  },
  [AttestationKind.BUG_BOUNTY]: {
    bg: 'hsl(38 80% 50% / 0.18)',
    border: 'hsl(38 70% 62% / 0.5)',
    text: 'hsl(38 90% 80%)',
  },
  [AttestationKind.SELF]: {
    bg: 'hsl(220 14% 36% / 0.36)',
    border: 'hsl(220 14% 60% / 0.4)',
    text: 'hsl(220 14% 80%)',
  },
};

const TIER_PALETTE: Record<
  AuditorTier,
  { bg: string; border: string; text: string }
> = {
  [AuditorTier.FIRST_PARTY]: {
    bg: 'hsl(150 70% 40% / 0.2)',
    border: 'hsl(150 70% 58% / 0.55)',
    text: 'hsl(150 80% 78%)',
  },
  [AuditorTier.INDEPENDENT]: {
    bg: 'hsl(210 75% 45% / 0.2)',
    border: 'hsl(210 70% 62% / 0.55)',
    text: 'hsl(210 90% 80%)',
  },
  [AuditorTier.COMMUNITY]: {
    bg: 'hsl(38 75% 50% / 0.2)',
    border: 'hsl(38 70% 62% / 0.55)',
    text: 'hsl(38 90% 80%)',
  },
};

const severityColor = (severity: number): string => {
  if (severity === 0) return 'hsl(150 64% 50%)';
  if (severity <= 2) return 'hsl(45 90% 60%)';
  if (severity === 3) return 'hsl(28 90% 60%)';
  return 'hsl(0 78% 60%)';
};

const shortenAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
};

const formatRelative = (timestampSeconds: bigint, now: Date): string => {
  const ts = Number(timestampSeconds);
  const diff = Math.floor(now.getTime() / 1000) - ts;
  if (diff < 0) {
    return `in ${formatDuration(-diff)}`;
  }
  return `${formatDuration(diff)} ago`;
};

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(days / 365);
  return `${years}y`;
};

const auditorDisplayName = (
  attester: string,
  auditor: Auditor | null,
): string => {
  if (auditor?.name?.trim()) return auditor.name;
  return `Anonymous (${shortenAddress(attester)})`;
};

interface AttestationBadgeProps {
  attestation: Attestation;
  auditor: Auditor | null;
  /** Wallet address currently connected, lowercased. */
  connectedAddress?: string | null;
  onRevoke?: (attestation: Attestation) => void;
  className?: string;
}

export const AttestationBadge: FC<AttestationBadgeProps> = ({
  attestation,
  auditor,
  connectedAddress,
  onRevoke,
  className,
}) => {
  const now = new Date();
  const kindStyle = KIND_PALETTE[attestation.kind];
  const tierStyle = auditor ? TIER_PALETTE[auditor.tier] : null;
  const sevColor = severityColor(attestation.severityFound);
  const isOwnAttestation =
    connectedAddress !== null &&
    connectedAddress !== undefined &&
    connectedAddress === attestation.attester.toLowerCase();

  const isExpired =
    attestation.expiresAt !== 0n &&
    Number(attestation.expiresAt) <= Math.floor(now.getTime() / 1000);
  const isRevoked = attestation.revoked;
  const isMuted = isExpired || isRevoked;

  return (
    <div
      className={twMerge(
        'flex flex-col gap-3 rounded-lg border border-border bg-card p-3 md:flex-row md:items-center md:justify-between',
        isMuted ? 'opacity-60' : '',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <AuditorAvatar attester={attestation.attester} auditor={auditor} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={twMerge(
                'truncate font-display font-bold text-foreground text-sm',
                isRevoked ? 'line-through' : '',
              )}
            >
              {auditorDisplayName(attestation.attester, auditor)}
            </span>
            {tierStyle && auditor && (
              <span
                className="inline-flex items-center rounded-full border px-1.5 py-px font-semibold text-[10px] uppercase tracking-wider"
                style={{
                  backgroundColor: tierStyle.bg,
                  borderColor: tierStyle.border,
                  color: tierStyle.text,
                }}
                title={`${auditorTierLabel(auditor.tier)} auditor · weight ${auditor.weight}`}
              >
                {auditorTierLabel(auditor.tier)}
              </span>
            )}
            {isRevoked && (
              <span className="text-destructive text-[10px] uppercase tracking-wider">
                (revoked)
              </span>
            )}
            {isExpired && !isRevoked && (
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                (expired)
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate font-mono text-muted-foreground text-xs">
            {attestation.attester}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-3">
        <span
          className="inline-flex items-center rounded-full border px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wider"
          style={{
            backgroundColor: kindStyle.bg,
            borderColor: kindStyle.border,
            color: kindStyle.text,
          }}
        >
          {attestationKindLabel(attestation.kind)}
        </span>

        <span
          className="inline-flex items-center gap-1.5 text-xs"
          title={severityLabel(attestation.severityFound)}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: sevColor }}
          />
          <span className="text-muted-foreground">
            {severityLabel(attestation.severityFound)}
          </span>
        </span>

        <span className="text-muted-foreground text-xs">
          Attested {formatRelative(attestation.attestedAt, now)}
          {attestation.expiresAt !== 0n && (
            <>
              {' · '}
              {isExpired ? 'expired' : 'expires'}{' '}
              {formatRelative(attestation.expiresAt, now)}
            </>
          )}
        </span>

        {attestation.reportUri && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            asChild
          >
            <a href={attestation.reportUri} target="_blank" rel="noreferrer">
              Read report ↗
            </a>
          </Button>
        )}

        {isOwnAttestation && !isRevoked && onRevoke && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onRevoke(attestation)}
          >
            Revoke
          </Button>
        )}
      </div>
    </div>
  );
};

const AuditorAvatar: FC<{ attester: string; auditor: Auditor | null }> = ({
  attester,
  auditor,
}) => {
  const initials = (auditor?.name?.trim() ?? attester.slice(2, 4))
    .slice(0, 2)
    .toUpperCase();
  const hue = Array.from(attester).reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) % 360,
    0,
  );
  return (
    <div
      className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border font-display font-extrabold text-white text-xs"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 64% 46%), hsl(${(hue + 36) % 360} 64% 36%))`,
      }}
      title={attester}
    >
      {initials}
    </div>
  );
};

/**
 * Convenience wrapper if the caller already has the joined shape.
 */
export const AttestationBadgeJoined: FC<{
  row: AttestationWithAuditor;
  connectedAddress?: string | null;
  onRevoke?: (attestation: Attestation) => void;
}> = ({ row, connectedAddress, onRevoke }) => (
  <AttestationBadge
    attestation={row}
    auditor={row.auditor}
    connectedAddress={connectedAddress}
    onRevoke={onRevoke}
  />
);

export default AttestationBadge;
