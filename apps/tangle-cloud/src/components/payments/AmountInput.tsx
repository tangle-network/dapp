import { FC, useCallback } from 'react';
import { formatUnits } from 'viem';

type Props = {
  value: string;
  onChange: (value: string) => void;
  balance?: bigint;
  decimals?: number;
  symbol?: string;
  label?: string;
  disabled?: boolean;
};

const AmountInput: FC<Props> = ({
  value,
  onChange,
  balance,
  decimals = 18,
  symbol = 'TOKEN',
  label = 'Amount',
  disabled = false,
}) => {
  const formattedBalance =
    balance !== undefined ? formatUnits(balance, decimals) : undefined;

  const handleMax = useCallback(() => {
    if (formattedBalance !== undefined) {
      onChange(formattedBalance);
    }
  }, [formattedBalance, onChange]);

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-mono-100 dark:text-mono-80">
        {label}
      </label>

      <div className="flex items-center gap-2 p-3 border rounded-lg border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180">
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*\.?[0-9]*"
          placeholder="0.0"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (/^[0-9]*\.?[0-9]*$/.test(val)) {
              onChange(val);
            }
          }}
          disabled={disabled}
          className="flex-1 text-lg bg-transparent outline-none text-mono-200 dark:text-mono-0 placeholder:text-mono-100 dark:text-mono-80"
        />

        <span className="text-sm font-medium text-mono-100 dark:text-mono-80">
          {symbol}
        </span>
      </div>

      {formattedBalance !== undefined && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-mono-100 dark:text-mono-80">
            Balance:{' '}
            {formattedBalance.match(/^\d+\.?\d{0,4}/)?.[0] ?? formattedBalance}{' '}
            {symbol}
          </span>

          <button
            type="button"
            onClick={handleMax}
            disabled={disabled}
            className="text-xs font-medium text-purple-40 hover:text-purple-40/80 disabled:opacity-50"
          >
            MAX
          </button>
        </div>
      )}
    </div>
  );
};

export default AmountInput;
