import {
  Typography,
  Label,
  shortenString,
} from '@tangle-network/ui-components';
import { FC, useMemo } from 'react';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import cx from 'classnames';
import type { Address } from 'viem';
import { formatUnits } from 'viem';
import { formatTokenAmount } from '@tangle-network/ui-components/utils/formatTokenAmount';

interface StandardApprovalInfoProps {
  /** Token address (or zero address for native) */
  tokenAddress: Address;
  /** Asset kind from contract (0 = Native, 1 = ERC20) */
  assetKind: number;
  /** Token metadata */
  metadata: {
    name: string;
    symbol: string;
    decimals?: number;
  } | null;
  /** Operator exposure in basis points (10000 = 100%) */
  operatorExposureBps: number;
  /** TNT security commitment in basis points */
  securityCommitmentBps: number;
  /** Operator's delegated amount */
  delegatedAmount: bigint | null;
  className?: string;
}

/**
 * Static display card for Basic/WithExposure approval.
 *
 * Shows the operator exposure and TNT security commitment as read-only
 * values (neither is changeable by the operator), plus a "Tokens at Risk"
 * warning derived from both.
 */
export const StandardApprovalInfo: FC<StandardApprovalInfoProps> = ({
  tokenAddress,
  assetKind,
  metadata,
  operatorExposureBps,
  securityCommitmentBps,
  delegatedAmount,
  className,
}) => {
  const displayName =
    metadata?.name ?? (assetKind === 0 ? 'Native Token' : 'Unknown Token');
  const displaySymbol =
    metadata?.symbol ??
    (assetKind === 0 ? 'ETH' : shortenString(tokenAddress, 4));
  const decimals = metadata?.decimals ?? 18;

  const effectiveRiskBps = useMemo(
    () => Math.floor((operatorExposureBps * securityCommitmentBps) / 10000),
    [operatorExposureBps, securityCommitmentBps],
  );

  const tokensAtRisk = useMemo(() => {
    if (delegatedAmount === null || delegatedAmount === undefined) {
      return null;
    }
    return (delegatedAmount * BigInt(effectiveRiskBps)) / BigInt(10000);
  }, [delegatedAmount, effectiveRiskBps]);

  const formattedDelegatedAmount = useMemo(() => {
    if (delegatedAmount === null || delegatedAmount === undefined) {
      return null;
    }
    const formatted = formatUnits(delegatedAmount, decimals);
    return formatTokenAmount(formatted);
  }, [delegatedAmount, decimals]);

  const formattedTokensAtRisk = useMemo(() => {
    if (tokensAtRisk === null) {
      return null;
    }
    const formatted = formatUnits(tokensAtRisk, decimals);
    return formatTokenAmount(formatted);
  }, [tokensAtRisk, decimals]);

  return (
    <div
      className={cx(
        'flex flex-col gap-4 p-4 bg-mono-20 dark:bg-mono-160 rounded-lg w-full',
        className,
      )}
    >
      {/* Asset header */}
      <div className="flex items-center gap-3">
        <LsTokenIcon name={displaySymbol} hasRainbowBorder size="lg" />

        <div className="min-w-0">
          <Typography
            variant="h5"
            className="text-mono-200 dark:text-mono-0 truncate"
          >
            {displayName}
          </Typography>

          <Typography
            variant="body3"
            className="text-mono-100 dark:text-mono-100 truncate"
          >
            {displaySymbol}
          </Typography>

          {delegatedAmount !== null &&
            delegatedAmount !== undefined &&
            delegatedAmount > BigInt(0) && (
              <Typography
                variant="body3"
                className="text-mono-120 dark:text-mono-80"
              >
                Your stake: {formattedDelegatedAmount} {displaySymbol}
              </Typography>
            )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-mono-0 dark:bg-mono-180 rounded-lg">
          <Label className="text-mono-100 dark:text-mono-100">
            Operator Exposure
          </Label>
          <Typography
            variant="h5"
            className="text-mono-200 dark:text-mono-0 mt-1"
          >
            {operatorExposureBps / 100}%
          </Typography>
          <Typography
            variant="body3"
            className="text-mono-100 dark:text-mono-80 mt-0.5"
          >
            Fixed by requester
          </Typography>
        </div>

        <div className="p-3 bg-mono-0 dark:bg-mono-180 rounded-lg">
          <Label className="text-mono-100 dark:text-mono-100">
            TNT Security Commitment
          </Label>
          <Typography
            variant="h5"
            className="text-mono-200 dark:text-mono-0 mt-1"
          >
            {securityCommitmentBps / 100}%
          </Typography>
          <Typography
            variant="body3"
            className="text-mono-100 dark:text-mono-80 mt-0.5"
          >
            Auto-committed at minimum
          </Typography>
        </div>
      </div>

      {/* Tokens at Risk warning */}
      {tokensAtRisk !== null && tokensAtRisk > BigInt(0) && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>

            <div>
              <Typography
                variant="body2"
                fw="bold"
                className="text-yellow-600 dark:text-yellow-400"
              >
                Tokens at Risk: {formattedTokensAtRisk} {displaySymbol}
              </Typography>

              <Typography
                variant="body3"
                className="text-mono-120 dark:text-mono-80 mt-1"
              >
                This amount can be slashed if the service misbehaves.
              </Typography>
            </div>
          </div>
        </div>
      )}

      {/* No delegation warning */}
      {delegatedAmount !== undefined &&
        delegatedAmount !== null &&
        delegatedAmount === BigInt(0) && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <Typography
                variant="body3"
                className="text-orange-600 dark:text-orange-400"
              >
                You have no stake for this asset.
              </Typography>
            </div>
          </div>
        )}
    </div>
  );
};

export default StandardApprovalInfo;
