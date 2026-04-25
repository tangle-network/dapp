import { FC } from 'react';
import { Card, Skeleton, Text } from '../../components/sandbox/SandboxUi';
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
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Text variant="h5" fw="semibold">
          Credit Accounts
        </Text>

        <Text variant="body2" className="mt-1 text-muted-foreground">
          Your anonymous credit accounts. Each shows on-chain balance and usage.
        </Text>
      </div>

      {creditAccounts.length === 0 ? (
        <Card className="text-center py-8">
          <Text variant="body1" className="text-muted-foreground">
            No credit accounts yet. Fund one from the shielded pool to get
            started.
          </Text>
        </Card>
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
