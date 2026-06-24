import { FC, useState } from 'react';
import { formatUnits } from 'viem';
import {
  StatCard,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tangle-network/sandbox-ui/primitives';
import DepositContainer from '../../containers/payments/DepositContainer';
import WithdrawContainer from '../../containers/payments/WithdrawContainer';
import { useShieldedContext } from '../../app/ShieldedProvider';
import RequireWallet from '../../components/RequireWallet';
import { TOKEN_DECIMALS } from '../../constants/payments';
import PaymentProviders from '../../app/PaymentProviders';

const enum PoolTab {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

const PaymentsPoolContent: FC = () => {
  const { shieldedBalance, notes } = useShieldedContext();
  const [activeTab, setActiveTab] = useState<PoolTab>(PoolTab.DEPOSIT);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-foreground text-3xl tracking-tight">
          Shielded Pool
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          Deposit tokens into the VAnchor shielded pool to gain privacy.
          Withdraw to a public address or fund anonymous credit accounts.
        </p>
      </div>

      <RequireWallet
        eyebrow="Shielded pool"
        title="Connect to use the shielded pool"
        description="Deposit TNT into Tangle's mixnet-integrated shielded pool for private transactions. Connect to manage your shielded balance."
        checks={['Shielded balance', 'Deposit', 'Withdraw']}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            variant="sandbox"
            title="Shielded Balance"
            value={formatUnits(shieldedBalance, TOKEN_DECIMALS)}
          />
          <StatCard
            variant="sandbox"
            title="Unspent Notes"
            value={notes.length}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(tab: string) => setActiveTab(tab as PoolTab)}
          className="space-y-5"
        >
          <TabsList className="flex h-auto w-full justify-start rounded-lg border border-border bg-card p-1 shadow-[var(--shadow-card)]">
            <TabsTrigger
              value={PoolTab.DEPOSIT}
              className="rounded-md px-3 py-2 font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Deposit
            </TabsTrigger>
            <TabsTrigger
              value={PoolTab.WITHDRAW}
              className="rounded-md px-3 py-2 font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value={PoolTab.DEPOSIT} className="max-w-lg">
            <DepositContainer />
          </TabsContent>
          <TabsContent value={PoolTab.WITHDRAW} className="max-w-lg">
            <WithdrawContainer />
          </TabsContent>
        </Tabs>
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
