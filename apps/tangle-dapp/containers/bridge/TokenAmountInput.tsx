import { ChevronDown } from '@webb-tools/icons';
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface TokenAmountInputProps {
  tokenIcon: React.ReactNode;
  tokenSymbol: string;
  onTokenClick?: () => void;
  amount: string;
  onAmountChange: (value: string) => void;
  balance?: string;
  maxAmount?: string;
  onMaxClick?: () => void;
  error?: boolean;
  usdValue?: string;
  className?: string;
}

export const TokenAmountInput: React.FC<TokenAmountInputProps> = ({
  tokenIcon,
  tokenSymbol,
  onTokenClick,
  amount,
  onAmountChange,
  balance,
  maxAmount,
  onMaxClick,
  error,
  usdValue,
  className,
}) => {
  return (
    <div className="space-y-1">
      <span className="block text-sm font-medium text-mono-140 dark:text-mono-80">
        Send
      </span>
      <div
        className={twMerge(
          'p-4 rounded-xl transition-colors',
          'bg-mono-20 dark:bg-mono-160',
          error && 'ring-2 ring-red-70 dark:ring-red-50',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0"
              className={twMerge(
                'w-full text-3xl font-medium bg-transparent placeholder:text-mono-120 focus:outline-none border-none',
                error
                  ? 'text-red-70 dark:text-red-50'
                  : 'text-mono-200 dark:text-mono-0',
              )}
            />
            <div className="flex items-center justify-between">
              {usdValue && (
                <span className="text-sm text-mono-120">{usdValue}</span>
              )}
              {balance && (
                <span className="text-sm text-mono-120">
                  Balance: {balance}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <button
              onClick={onTokenClick}
              className="flex items-center gap-3 px-4 py-2 rounded-xl transition-colors bg-mono-40/50 dark:bg-mono-140/50 hover:bg-mono-60/50 dark:hover:bg-mono-120/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  {' '}
                  {/* Increased from w-8 h-8 */}
                  {tokenIcon}
                </div>
                <span className="text-lg font-semibold text-mono-200 dark:text-mono-0">
                  {' '}
                  {/* Increased from text-base */}
                  {tokenSymbol}
                </span>
                <ChevronDown className="text-mono-120 w-4 h-4" />
              </div>
            </button>
            {maxAmount && (
              <button
                onClick={onMaxClick}
                className="text-xs font-medium text-primary-50 hover:text-primary-40 transition-colors px-2"
              >
                MAX
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
