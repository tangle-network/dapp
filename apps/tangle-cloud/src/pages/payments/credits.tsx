import { FC, useState } from 'react';
import { useAccount } from 'wagmi';
import FundCreditsContainer from '../../containers/payments/FundCreditsContainer';
import SpendAuthContainer from '../../containers/payments/SpendAuthContainer';
import CreditBalanceContainer from '../../containers/payments/CreditBalanceContainer';

const enum CreditsTab {
  BALANCE = 'balance',
  FUND = 'fund',
  SPEND = 'spend',
}

const PaymentsCreditsPage: FC = () => {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<CreditsTab>(CreditsTab.BALANCE);

  return (
    <div className="px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-mono-200 dark:text-mono-0">
          Anonymous Credits
        </h1>

        <p className="mt-1 text-mono-120 dark:text-mono-80">
          Fund prepaid credit accounts for private pay-per-use cloud services.
          One ZK proof funds the account; cheap signatures authorize each job.
        </p>
      </div>

      <div className="flex border-b border-mono-40 dark:border-mono-160">
        {(
          [
            [CreditsTab.BALANCE, 'Accounts'],
            [CreditsTab.FUND, 'Fund'],
            [CreditsTab.SPEND, 'Authorize'],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
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

      <div className="max-w-2xl">
        {!address ? (
          <div className="p-6 text-center border rounded-xl border-mono-40 dark:border-mono-160">
            <p className="text-sm text-mono-100">
              Connect your wallet to manage credit accounts.
            </p>
          </div>
        ) : activeTab === CreditsTab.BALANCE ? (
          <CreditBalanceContainer />
        ) : activeTab === CreditsTab.FUND ? (
          <FundCreditsContainer />
        ) : (
          <SpendAuthContainer />
        )}
      </div>
    </div>
  );
};

export default PaymentsCreditsPage;
