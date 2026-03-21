import { FC, useState } from 'react';
import { Typography } from '@tangle-network/ui-components';
import FundCreditsContainer from '../../containers/payments/FundCreditsContainer';
import SpendAuthContainer from '../../containers/payments/SpendAuthContainer';
import CreditBalanceContainer from '../../containers/payments/CreditBalanceContainer';
import RequireWallet from '../../components/RequireWallet';

const enum CreditsTab {
  BALANCE = 'balance',
  FUND = 'fund',
  SPEND = 'spend',
}

const PaymentsCreditsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<CreditsTab>(CreditsTab.BALANCE);

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h4" fw="bold">
          Anonymous Credits
        </Typography>

        <Typography variant="body1" className="mt-1 text-mono-100">
          Fund prepaid credit accounts for private pay-per-use cloud services.
          One ZK proof funds the account; cheap signatures authorize each job.
        </Typography>
      </div>

      <RequireWallet
        title="Connect to manage Credits"
        description="A wallet connection is required to fund and manage credit accounts."
      >
        <div
          className="flex border-b border-mono-40 dark:border-mono-160"
          role="tablist"
        >
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

        <div className="max-w-2xl" role="tabpanel">
          {activeTab === CreditsTab.BALANCE ? (
            <CreditBalanceContainer />
          ) : activeTab === CreditsTab.FUND ? (
            <FundCreditsContainer />
          ) : (
            <SpendAuthContainer />
          )}
        </div>
      </RequireWallet>
    </div>
  );
};

export default PaymentsCreditsPage;
