import { FC, useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tangle-network/sandbox-ui/primitives';
import FundCreditsContainer from '../../containers/payments/FundCreditsContainer';
import SpendAuthContainer from '../../containers/payments/SpendAuthContainer';
import CreditBalanceContainer from '../../containers/payments/CreditBalanceContainer';
import RequireWallet from '../../components/RequireWallet';
import { PageHeader } from '../../components/chrome';
import TangleCloudCard from '../../components/TangleCloudCard';
import PaymentProviders from '../../app/PaymentProviders';

const enum CreditsTab {
  BALANCE = 'balance',
  FUND = 'fund',
  SPEND = 'spend',
}

const PaymentsCreditsContent: FC = () => {
  const [activeTab, setActiveTab] = useState<CreditsTab>(CreditsTab.BALANCE);

  return (
    <div className="space-y-6">
      <PageHeader
        density="compact"
        title="Anonymous Credits"
        subtitle="Fund prepaid credit accounts and authorize service usage without sending a wallet transaction for every job."
      />

      <RequireWallet
        eyebrow="Credits"
        title="Connect to manage anonymous credits"
        description="Fund credit accounts for pay-per-use inference — authorize spend without a wallet transaction per job. Connect to create and fund accounts."
        checks={['Credit accounts', 'Fund account', 'Authorize spend']}
      >
        <TangleCloudCard className="space-y-5">
          <Tabs
            value={activeTab}
            onValueChange={(tab: string) => setActiveTab(tab as CreditsTab)}
          >
            <TabsList className="flex w-full gap-1 rounded-xl border border-mono-60 dark:border-mono-170 bg-mono-20 dark:bg-mono-190 p-1">
              <TabsTrigger
                value={CreditsTab.BALANCE}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-mono-120 dark:text-mono-100 transition-colors data-[state=active]:bg-mono-0 data-[state=active]:text-mono-200 dark:data-[state=active]:bg-mono-180 dark:data-[state=active]:text-mono-0"
              >
                Accounts
              </TabsTrigger>
              <TabsTrigger
                value={CreditsTab.FUND}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-mono-120 dark:text-mono-100 transition-colors data-[state=active]:bg-mono-0 data-[state=active]:text-mono-200 dark:data-[state=active]:bg-mono-180 dark:data-[state=active]:text-mono-0"
              >
                Fund
              </TabsTrigger>
              <TabsTrigger
                value={CreditsTab.SPEND}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-mono-120 dark:text-mono-100 transition-colors data-[state=active]:bg-mono-0 data-[state=active]:text-mono-200 dark:data-[state=active]:bg-mono-180 dark:data-[state=active]:text-mono-0"
              >
                Authorize
              </TabsTrigger>
            </TabsList>

            <TabsContent value={CreditsTab.BALANCE}>
              <CreditBalanceContainer />
            </TabsContent>
            <TabsContent value={CreditsTab.FUND}>
              <FundCreditsContainer />
            </TabsContent>
            <TabsContent value={CreditsTab.SPEND}>
              <SpendAuthContainer />
            </TabsContent>
          </Tabs>
        </TangleCloudCard>
      </RequireWallet>
    </div>
  );
};

const PaymentsCreditsPage: FC = () => (
  <PaymentProviders>
    <PaymentsCreditsContent />
  </PaymentProviders>
);

export default PaymentsCreditsPage;
