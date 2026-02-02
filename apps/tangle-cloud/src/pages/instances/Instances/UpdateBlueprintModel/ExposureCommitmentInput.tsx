import { Typography, Label, Slider } from '@tangle-network/ui-components';
import { FC } from 'react';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import cx from 'classnames';
import type { Address } from 'viem';
import { shortenString } from '@tangle-network/ui-components';

interface ExposureCommitmentInputProps {
  /** Token address (or zero address for native) */
  tokenAddress: Address;
  /** Asset kind from contract (0 = Native, 1 = ERC20) */
  assetKind: number;
  /** Token metadata */
  metadata: {
    name: string;
    symbol: string;
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
}) => {
  // Convert basis points to percentage for display
  const minPercent = minExposureBps / 100;
  const maxPercent = maxExposureBps / 100;
  const valuePercent = value / 100;

  // Display name: use metadata if available, otherwise derive from address
  const displayName = metadata?.name ?? (assetKind === 0 ? 'Native Token' : 'Unknown Token');
  const displaySymbol = metadata?.symbol ?? (assetKind === 0 ? 'ETH' : shortenString(tokenAddress, 4));

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
      <div className="flex items-center gap-3 flex-shrink-0 lg:w-[200px]">
        <LsTokenIcon
          name={displaySymbol}
          hasRainbowBorder
          size="lg"
        />
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

        {errorMessage && (
          <Typography
            variant="body3"
            className="mt-2 text-red-50"
          >
            {errorMessage}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default ExposureCommitmentInput;
