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
        <Tabs
          value={activeTab}
          onValueChange={(tab: string) => setActiveTab(tab as CreditsTab)}
          className="space-y-5"
        >
          <TabsList className="flex h-auto w-full justify-start rounded-lg border border-border bg-card p-1 shadow-[var(--shadow-card)]">
            <TabsTrigger
              value={CreditsTab.BALANCE}
              className="rounded-md px-3 py-2 font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Accounts
            </TabsTrigger>
            <TabsTrigger
              value={CreditsTab.FUND}
              className="rounded-md px-3 py-2 font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Fund
            </TabsTrigger>
            <TabsTrigger
              value={CreditsTab.SPEND}
              className="rounded-md px-3 py-2 font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Authorize
            </TabsTrigger>
          </TabsList>

          <TabsContent value={CreditsTab.BALANCE} className="max-w-2xl">
            <CreditBalanceContainer />
          </TabsContent>
          <TabsContent value={CreditsTab.FUND} className="max-w-2xl">
            <FundCreditsContainer />
          </TabsContent>
          <TabsContent value={CreditsTab.SPEND} className="max-w-2xl">
            <SpendAuthContainer />
          </TabsContent>
        </Tabs>
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
