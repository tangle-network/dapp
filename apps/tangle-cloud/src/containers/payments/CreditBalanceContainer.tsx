import { FC } from 'react';
import { useCreditsContext } from '../../app/CreditsProvider';
import CreditAccountCard from '../../components/payments/CreditAccountCard';
import useCreditAccountState from '../../data/payments/useCreditAccountState';
import type { Hex } from 'viem';
import type { CreditAccountState } from '../../types/shielded';

const CreditAccountWithState: FC<{
  commitment: string;
  label?: string;
  onRemove: () => void;
}> = ({ commitment, label, onRemove }) => {
  const { data, isLoading } = useCreditAccountState(commitment as Hex);

  // viem returns ABI-typed struct as an object with named fields
  let accountState: CreditAccountState | undefined;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if ('balance' in d) {
      accountState = {
        spendingKey: String(d.spendingKey ?? ''),
        token: String(d.token ?? ''),
        balance: BigInt((d.balance as bigint) ?? 0),
        totalFunded: BigInt((d.totalFunded as bigint) ?? 0),
        totalSpent: BigInt((d.totalSpent as bigint) ?? 0),
        nonce: BigInt((d.nonce as bigint) ?? 0),
      };
    }
  }

  return (
    <CreditAccountCard
      commitment={commitment}
      label={label}
      accountState={accountState}
      isLoading={isLoading}
      onDelete={onRemove}
    />
  );
};

const CreditBalanceContainer: FC = () => {
  const { creditAccounts, removeCreditAccount, isLoading } =
    useCreditsContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 rounded-full animate-spin border-mono-80 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-mono-200 dark:text-mono-0">
        Credit Accounts
      </h2>

      <p className="text-sm text-mono-120 dark:text-mono-80">
        Your anonymous credit accounts. Each shows on-chain balance and usage.
      </p>

      {creditAccounts.length === 0 ? (
        <div className="p-6 text-sm text-center border rounded-lg border-mono-40 dark:border-mono-160 text-mono-100">
          No credit accounts yet. Fund one from the shielded pool to get
          started.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {creditAccounts.map((acct) => (
            <CreditAccountWithState
              key={acct.commitment}
              commitment={acct.commitment}
              label={acct.label}
              onRemove={() => removeCreditAccount(acct.commitment)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CreditBalanceContainer;
