import { Text } from '../../../../components/sandbox/SandboxUi';
import { FC, useMemo } from 'react';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import cx from 'classnames';
import type { Address } from 'viem';
import { formatUnits } from 'viem';

const shortenString = (value: string, chars = 6) =>
  value.length > chars * 2 + 3
    ? `${value.slice(0, chars)}...${value.slice(-chars)}`
    : value;

const formatTokenAmount = (value: string) =>
  Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });

interface ExposureCommitmentInputProps {
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
  /** Minimum allowed exposure in basis points (0-10000) */
  minExposureBps: number;
  /** Maximum allowed exposure in basis points (0-10000) */
  maxExposureBps: number;
  /** Current selected exposure value in basis points */
  value: number;
  /** Callback when exposure value changes */
  onChange: (valueBps: number) => void;
  /** Error message to display */
  errorMessage?: string;
  /** Additional class name */
  className?: string;
  /** Operator's delegated amount for this asset (optional) */
  delegatedAmount?: bigint | null;
  /**
   * Operator exposure in basis points (0-10000). When provided, displayed as
   * a read-only info row. For WithExposure mode this is set per-operator by
   * the deployer; for Basic and WithSecurity it is always 10000 (100%).
   */
  operatorExposureBps?: number;
}

/**
 * Interactive exposure commitment input for WithSecurity service approval.
 *
 * Displays:
 * - Asset icon and name
 * - Allowed min/max range as labels
 * - Single-thumb slider for operator's exposure commitment
 * - Error message if validation fails
 *
 * @example
 * ```tsx
 * <ExposureCommitmentInput
 *   tokenAddress="0x..."
 *   assetKind={1}
 *   metadata={{ name: "Test Token", symbol: "TST" }}
 *   minExposureBps={5000}
 *   maxExposureBps={10000}
 *   value={7500}
 *   onChange={(bps) => setCommitment(bps)}
 * />
 * ```
 */
export const ExposureCommitmentInput: FC<ExposureCommitmentInputProps> = ({
  tokenAddress,
  assetKind,
  metadata,
  minExposureBps,
  maxExposureBps,
  value,
  onChange,
  errorMessage,
  className,
  delegatedAmount,
  operatorExposureBps = 10000,
}) => {
  // Convert basis points to percentage for display
  const minPercent = minExposureBps / 100;
  const maxPercent = maxExposureBps / 100;
  const valuePercent = value / 100;

  // Display name: use metadata if available, otherwise derive from address
  const displayName =
    metadata?.name ?? (assetKind === 0 ? 'Native Token' : 'Unknown Token');
  const displaySymbol =
    metadata?.symbol ??
    (assetKind === 0 ? 'ETH' : shortenString(tokenAddress, 4));
  const decimals = metadata?.decimals ?? 18;

  // Effective risk accounts for both operator exposure and TNT commitment.
  // For WithSecurity, operatorExposureBps defaults to 10000 (100%).
  const effectiveRiskBps = useMemo(
    () => Math.floor((operatorExposureBps * value) / 10000),
    [operatorExposureBps, value],
  );

  const tokensAtRisk = useMemo(() => {
    if (delegatedAmount === null || delegatedAmount === undefined) {
      return null;
    }
    return (delegatedAmount * BigInt(effectiveRiskBps)) / BigInt(10000);
  }, [delegatedAmount, effectiveRiskBps]);

  // Format delegated amount for display
  const formattedDelegatedAmount = useMemo(() => {
    if (delegatedAmount === null || delegatedAmount === undefined) {
      return null;
    }
    const formatted = formatUnits(delegatedAmount, decimals);
    return formatTokenAmount(formatted);
  }, [delegatedAmount, decimals]);

  // Format tokens at risk for display
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
        'flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 p-4 bg-mono-20/50 dark:bg-mono-190/50 rounded-lg w-full',
        className,
      )}
    >
      {/* Asset info section */}
      <div className="flex items-center gap-3 flex-shrink-0 lg:w-[220px]">
        <LsTokenIcon name={displaySymbol} hasRainbowBorder size="lg" />

        <div className="min-w-0">
          <Text variant="h5" className="truncate">
            {displayName}
          </Text>

          <Text
            variant="body3"
            className="text-mono-120 dark:text-mono-100 truncate"
          >
            {displaySymbol}
          </Text>

          {delegatedAmount !== null &&
            delegatedAmount !== undefined &&
            delegatedAmount > BigInt(0) && (
              <Text
                variant="body3"
                className="text-mono-120 dark:text-mono-100"
              >
                Your stake: {formattedDelegatedAmount} {displaySymbol}
              </Text>
            )}
        </div>
      </div>

      {/* Slider section */}
      <div className="flex-1 min-w-0">
        {/* Operator exposure info (read-only) */}
        {operatorExposureBps !== undefined && (
          <div className="flex items-center justify-between mb-3 p-2 bg-mono-0 dark:bg-mono-190 rounded-lg">
            <label className="text-mono-120 dark:text-mono-100">
              Operator Exposure
            </label>
            <Text
              variant="body2"
              fw="bold"
              className="text-mono-200 dark:text-mono-0"
            >
              {operatorExposureBps / 100}%
              <span className="text-mono-120 dark:text-mono-100 font-normal text-xs ml-1">
                {operatorExposureBps < 10000
                  ? '(set by deployer)'
                  : '(protocol default)'}
              </span>
            </Text>
          </div>
        )}

        <div className="flex justify-between items-center mb-2">
          <label className="text-mono-200 dark:text-mono-0 font-medium">
            Your Exposure Commitment
          </label>
          <Text variant="body2" className="text-mono-120 dark:text-mono-100">
            Range: {minPercent}% - {maxPercent}%
          </Text>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={minPercent}
            max={maxPercent}
            step={1}
            value={valuePercent}
            onChange={(event) =>
              onChange(Math.round(Number(event.currentTarget.value) * 100))
            }
            className="h-2 w-full cursor-pointer accent-primary"
          />

          {/* Current value display */}
          <div className="flex justify-between text-sm">
            <span className="text-mono-120 dark:text-mono-100">
              Min: {minPercent}%
            </span>

            <span className="text-purple-40 font-medium">
              Selected: {valuePercent}%
            </span>

            <span className="text-mono-120 dark:text-mono-100">
              Max: {maxPercent}%
            </span>
          </div>
        </div>

        {/* Tokens at Risk warning - only show if delegation > 0 */}
        {tokensAtRisk !== null && tokensAtRisk > BigInt(0) && (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
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
                <Text
                  variant="body2"
                  fw="bold"
                  className="text-yellow-600 dark:text-yellow-400"
                >
                  Tokens at Risk: {formattedTokensAtRisk} {displaySymbol}
                </Text>

                <Text
                  variant="body3"
                  className="text-mono-120 dark:text-mono-100 mt-1"
                >
                  This amount can be slashed if the service misbehaves.
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* No delegation warning - only show if delegation is exactly 0 */}
        {delegatedAmount !== undefined &&
          delegatedAmount !== null &&
          delegatedAmount === BigInt(0) && (
            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
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

                <Text
                  variant="body3"
                  className="text-orange-600 dark:text-orange-400"
                >
                  You have no stake for this asset.
                </Text>
              </div>
            </div>
          )}

        {errorMessage && (
          <Text variant="body3" className="mt-2 text-red-500 dark:text-red-400">
            {errorMessage}
          </Text>
        )}
      </div>
    </div>
  );
};

export default ExposureCommitmentInput;
