import { FC, useState } from 'react';
import { formatUnits } from 'viem';
import { Typography, Card, CardVariant } from '@tangle-network/ui-components';
import DepositContainer from '../../containers/payments/DepositContainer';
import WithdrawContainer from '../../containers/payments/WithdrawContainer';
import { useShieldedContext } from '../../app/ShieldedProvider';
import RequireWallet from '../../components/RequireWallet';
import { TOKEN_DECIMALS } from '../../constants/payments';

const enum PoolTab {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

const PaymentsPoolPage: FC = () => {
  const { shieldedBalance, notes } = useShieldedContext();
  const [activeTab, setActiveTab] = useState<PoolTab>(PoolTab.DEPOSIT);

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h4" fw="bold">
          Shielded Pool
        </Typography>

        <Typography variant="body1" className="mt-1 text-mono-100">
          Deposit tokens into the VAnchor shielded pool to gain privacy.
          Withdraw to a public address or fund anonymous credit accounts.
        </Typography>
      </div>

      <RequireWallet
        title="Connect to use the Shielded Pool"
        description="A wallet connection is required to deposit and withdraw from the shielded pool."
      >
        <div className="flex gap-4">
          <Card variant={CardVariant.DEFAULT} className="flex-1" tightPadding>
            <Typography variant="body2" className="text-mono-100">
              Shielded Balance
            </Typography>

            <Typography variant="h4" fw="bold" className="mt-1">
              {formatUnits(shieldedBalance, TOKEN_DECIMALS)}
            </Typography>
          </Card>

          <Card variant={CardVariant.DEFAULT} className="flex-1" tightPadding>
            <Typography variant="body2" className="text-mono-100">
              Unspent Notes
            </Typography>

            <Typography variant="h4" fw="bold" className="mt-1">
              {notes.length}
            </Typography>
          </Card>
        </div>

        <div
          className="flex border-b border-mono-40 dark:border-mono-160"
          role="tablist"
        >
          {(
            [
              [PoolTab.DEPOSIT, 'Deposit'],
              [PoolTab.WITHDRAW, 'Withdraw'],
            ] as const
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-50 text-blue-50'
                  : 'border-transparent text-mono-100 hover:text-mono-200 dark:hover:text-mono-0'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="max-w-lg" role="tabpanel">
          {activeTab === PoolTab.DEPOSIT ? (
            <DepositContainer />
          ) : (
            <WithdrawContainer />
          )}
        </div>
      </RequireWallet>
    </div>
  );
};

export default PaymentsPoolPage;
