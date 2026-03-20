import { FC } from 'react';
import { formatUnits } from 'viem';
import type { CreditAccountState } from '../../types/shielded';
import { TOKEN_DECIMALS } from '../../constants/payments';

type Props = {
  commitment: string;
  label?: string;
  accountState?: CreditAccountState;
  isLoading?: boolean;
  onWithdraw?: () => void;
  onDelete?: () => void;
};

const CreditAccountCard: FC<Props> = ({
  commitment,
  label,
  accountState,
  isLoading,
  onWithdraw,
  onDelete,
}) => {
  const truncateHex = (hex: string, chars = 8) =>
    `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;

  return (
    <div className="p-4 space-y-3 border rounded-lg border-mono-40 dark:border-mono-160 bg-mono-0 dark:bg-mono-200">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-mono-200 dark:text-mono-0">
            {label ?? 'Credit Account'}
          </span>

          <p className="mt-0.5 font-mono text-xs text-mono-100 dark:text-mono-100">
            {truncateHex(commitment)}
          </p>
        </div>

        {isLoading && (
          <div className="w-4 h-4 border-2 rounded-full animate-spin border-mono-80 border-t-transparent" />
        )}
      </div>

      {accountState && (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-mono-100 dark:text-mono-100">
              Balance
            </span>

            <span className="text-lg font-semibold text-mono-200 dark:text-mono-0">
              {formatUnits(accountState.balance, TOKEN_DECIMALS)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-mono-100 dark:text-mono-100">
            <div>
              <span>Total Funded</span>
              <p className="font-mono text-mono-200 dark:text-mono-0">
                {formatUnits(accountState.totalFunded, TOKEN_DECIMALS)}
              </p>
            </div>

            <div>
              <span>Total Spent</span>
              <p className="font-mono text-mono-200 dark:text-mono-0">
                {formatUnits(accountState.totalSpent, TOKEN_DECIMALS)}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            {onWithdraw && accountState.balance > 0n && (
              <button
                type="button"
                onClick={onWithdraw}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-50 border border-blue-50 rounded hover:bg-blue-50/10"
              >
                Withdraw
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-3 py-1.5 text-xs text-red-70 dark:text-red-50 border border-red-70 dark:border-red-50 rounded hover:bg-red-50/10"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditAccountCard;
