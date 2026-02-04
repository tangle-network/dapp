import {
  Typography,
  Label,
  Slider,
  shortenString,
} from '@tangle-network/ui-components';
import { FC, useMemo } from 'react';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import cx from 'classnames';
import type { Address } from 'viem';
import { formatUnits } from 'viem';
import { formatTokenAmount } from '@tangle-network/ui-components/utils/formatTokenAmount';

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
}

/**
 * Single-value exposure commitment input for service approval.
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

  // Calculate tokens at risk based on exposure percentage
  const tokensAtRisk = useMemo(() => {
    if (delegatedAmount === null || delegatedAmount === undefined) {
      return null;
    }
    // tokensAtRisk = delegatedAmount * exposureBps / 10000
    return (delegatedAmount * BigInt(value)) / BigInt(10000);
  }, [delegatedAmount, value]);

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

  const handleSliderChange = (values: number[]) => {
    // Single-thumb slider returns array with one value
    const newPercent = values[0];
    // Convert percentage back to basis points
    onChange(Math.round(newPercent * 100));
  };

  return (
    <div
      className={cx(
        'flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 p-4 bg-mono-20 dark:bg-mono-160 rounded-lg w-full',
        className,
      )}
    >
      {/* Asset info section */}
      <div className="flex items-center gap-3 flex-shrink-0 lg:w-[220px]">
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

      {/* Slider section */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-2">
          <Label className="text-mono-200 dark:text-mono-0">
            Your Exposure Commitment
          </Label>
          <Typography
            variant="body2"
            className="text-mono-100 dark:text-mono-100"
          >
            Range: {minPercent}% - {maxPercent}%
          </Typography>
        </div>

        <div className="space-y-2">
          <Slider
            hasLabel
            min={minPercent}
            max={maxPercent}
            step={1}
            value={[valuePercent]}
            onChange={handleSliderChange}
            className="w-full"
          />

          {/* Current value display */}
          <div className="flex justify-between text-sm">
            <span className="text-mono-100 dark:text-mono-100">
              Min: {minPercent}%
            </span>

            <span className="text-blue-50 font-medium">
              Selected: {valuePercent}%
            </span>

            <span className="text-mono-100 dark:text-mono-100">
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

                <Typography
                  variant="body3"
                  className="text-orange-600 dark:text-orange-400"
                >
                  You have no stake for this asset.
                </Typography>
              </div>
            </div>
          )}

        {errorMessage && (
          <Typography variant="body3" className="mt-2 text-red-50">
            {errorMessage}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default ExposureCommitmentInput;
