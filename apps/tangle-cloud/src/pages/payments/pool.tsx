import { FC, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import DepositContainer from '../../containers/payments/DepositContainer';
import WithdrawContainer from '../../containers/payments/WithdrawContainer';
import { useShieldedContext } from '../../app/ShieldedProvider';
import { TOKEN_DECIMALS } from '../../constants/payments';

const enum PoolTab {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

const PaymentsPoolPage: FC = () => {
  const { address } = useAccount();
  const { shieldedBalance, notes } = useShieldedContext();
  const [activeTab, setActiveTab] = useState<PoolTab>(PoolTab.DEPOSIT);

  return (
    <div className="px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-mono-200 dark:text-mono-0">
          Shielded Pool
        </h1>

        <p className="mt-1 text-mono-120 dark:text-mono-80">
          Deposit tokens into the VAnchor shielded pool to gain privacy.
          Withdraw to a public address or fund anonymous credit accounts.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 p-4 border rounded-xl border-mono-40 dark:border-mono-160 bg-mono-0 dark:bg-mono-200">
          <span className="text-xs text-mono-100 dark:text-mono-100">
            Shielded Balance
          </span>

          <p className="mt-1 text-xl font-bold text-mono-200 dark:text-mono-0">
            {formatUnits(shieldedBalance, TOKEN_DECIMALS)}
          </p>
        </div>

        <div className="flex-1 p-4 border rounded-xl border-mono-40 dark:border-mono-160 bg-mono-0 dark:bg-mono-200">
          <span className="text-xs text-mono-100 dark:text-mono-100">
            Unspent Notes
          </span>

          <p className="mt-1 text-xl font-bold text-mono-200 dark:text-mono-0">
            {notes.length}
          </p>
        </div>
      </div>

      <div className="flex border-b border-mono-40 dark:border-mono-160">
        <button
          type="button"
          onClick={() => setActiveTab(PoolTab.DEPOSIT)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === PoolTab.DEPOSIT
              ? 'border-blue-50 text-blue-50'
              : 'border-transparent text-mono-100 hover:text-mono-200 dark:hover:text-mono-0'
          }`}
        >
          Deposit
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(PoolTab.WITHDRAW)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === PoolTab.WITHDRAW
              ? 'border-blue-50 text-blue-50'
              : 'border-transparent text-mono-100 hover:text-mono-200 dark:hover:text-mono-0'
          }`}
        >
          Withdraw
        </button>
      </div>

      <div className="max-w-lg">
        {!address ? (
          <div className="p-6 text-center border rounded-xl border-mono-40 dark:border-mono-160">
            <p className="text-sm text-mono-100">
              Connect your wallet to use the shielded pool.
            </p>
          </div>
        ) : activeTab === PoolTab.DEPOSIT ? (
          <DepositContainer />
        ) : (
          <WithdrawContainer />
        )}
      </div>
    </div>
  );
};

export default PaymentsPoolPage;
