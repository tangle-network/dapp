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
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>

      <div className="flex items-center gap-2 p-3 border rounded-lg border-border bg-card">
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
          className="flex-1 text-lg bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />

        <span className="text-sm font-medium text-muted-foreground">
          {symbol}
        </span>
      </div>

      {formattedBalance !== undefined && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">
            Balance:{' '}
            {formattedBalance.match(/^\d+\.?\d{0,4}/)?.[0] ?? formattedBalance}{' '}
            {symbol}
          </span>

          <button
            type="button"
            onClick={handleMax}
            disabled={disabled}
            className="text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50"
          >
            MAX
          </button>
        </div>
      )}
    </div>
  );
};

export default AmountInput;
