import { FC, useState } from 'react';
import { formatUnits } from 'viem';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tangle-network/sandbox-ui/primitives';
import DepositContainer from '../../containers/payments/DepositContainer';
import WithdrawContainer from '../../containers/payments/WithdrawContainer';
import { useShieldedContext } from '../../app/ShieldedProvider';
import RequireWallet from '../../components/RequireWallet';
import { PageHeader } from '../../components/chrome';
import TangleCloudCard from '../../components/TangleCloudCard';
import PaymentsNav from '../../components/PaymentsNav';
import { TOKEN_DECIMALS } from '../../constants/payments';
import PaymentProviders from '../../app/PaymentProviders';

const enum PoolTab {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

const StatTile: FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <TangleCloudCard className="flex flex-col gap-1">
    <span className="text-xs font-semibold uppercase tracking-wide text-mono-100 dark:text-mono-80">
      {label}
    </span>
    <span className="font-mono text-2xl font-bold text-mono-200 dark:text-mono-0">
      {value}
    </span>
  </TangleCloudCard>
);

const PaymentsPoolContent: FC = () => {
  const { shieldedBalance, notes } = useShieldedContext();
  const [activeTab, setActiveTab] = useState<PoolTab>(PoolTab.DEPOSIT);

  return (
    <div className="space-y-6">
      <PageHeader density="compact" title="Payments" />

      <PaymentsNav />

      <RequireWallet
        eyebrow="Shielded pool"
        title="Connect to use the shielded pool"
        description="Deposit TNT into Tangle's mixnet-integrated shielded pool for private transactions. Connect to manage your shielded balance."
        checks={['Shielded balance', 'Deposit', 'Withdraw']}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <StatTile
            label="Shielded Balance"
            value={formatUnits(shieldedBalance, TOKEN_DECIMALS)}
          />
          <StatTile label="Unspent Notes" value={notes.length} />
        </div>

        <TangleCloudCard className="space-y-5">
          <Tabs
            value={activeTab}
            onValueChange={(tab: string) => setActiveTab(tab as PoolTab)}
          >
            <TabsList className="flex w-full gap-1 rounded-xl border border-mono-60 dark:border-mono-170 bg-mono-20 dark:bg-mono-190 p-1">
              <TabsTrigger
                value={PoolTab.DEPOSIT}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-mono-100 dark:text-mono-80 transition-colors data-[state=active]:bg-mono-0 data-[state=active]:text-mono-200 dark:data-[state=active]:bg-mono-180 dark:data-[state=active]:text-mono-0"
              >
                Deposit
              </TabsTrigger>
              <TabsTrigger
                value={PoolTab.WITHDRAW}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-mono-100 dark:text-mono-80 transition-colors data-[state=active]:bg-mono-0 data-[state=active]:text-mono-200 dark:data-[state=active]:bg-mono-180 dark:data-[state=active]:text-mono-0"
              >
                Withdraw
              </TabsTrigger>
            </TabsList>

            <TabsContent value={PoolTab.DEPOSIT}>
              <DepositContainer />
            </TabsContent>
            <TabsContent value={PoolTab.WITHDRAW}>
              <WithdrawContainer />
            </TabsContent>
          </Tabs>
        </TangleCloudCard>
      </RequireWallet>
    </div>
  );
};

const PaymentsPoolPage: FC = () => (
  <PaymentProviders>
    <PaymentsPoolContent />
  </PaymentProviders>
);

export default PaymentsPoolPage;
