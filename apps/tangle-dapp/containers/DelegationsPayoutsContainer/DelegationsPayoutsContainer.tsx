'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  TabContent,
  TableAndChartTabs,
  useCheckMobile,
} from '@webb-tools/webb-ui-components';

import { ContainerSkeleton, TableStatus } from '../../components';

const delegationsTableTab = 'Delegations';
const payoutsTableTab = 'Payouts';

const DelegationsPayoutsContainer = () => {
  const { activeAccount, loading } = useWebContext();

  const { isMobile } = useCheckMobile();

  const { toggleModal } = useConnectWallet();

  return (
    <TableAndChartTabs
      tabs={[delegationsTableTab, payoutsTableTab]}
      headerClassName="w-full overflow-x-auto"
    >
      {/* Delegations Table */}
      <TabContent value={delegationsTableTab}>
        {!activeAccount ? (
          <TableStatus
            title="Wallet Not Connected"
            description="Connect your wallet to view and manage your staking details."
            buttonText="Connect"
            buttonProps={{
              isLoading: loading,
              isDisabled: isMobile,
              loadingText: 'Connecting...',
              onClick: () =>
                toggleModal(
                  true,
                  PresetTypedChainId.TangleTestnet ?? undefined
                ),
            }}
            icon="🔗"
          />
        ) : (
          <ContainerSkeleton />
        )}
      </TabContent>

      {/* Payouts Table */}
      <TabContent value={payoutsTableTab}>
        {!activeAccount ? (
          <TableStatus
            title="Wallet Not Connected"
            description="Connect your wallet to view and manage your staking details."
            buttonText="Connect"
            buttonProps={{
              isLoading: loading,
              isDisabled: isMobile,
              loadingText: 'Connecting...',
              onClick: () =>
                toggleModal(
                  true,
                  PresetTypedChainId.TangleTestnet ?? undefined
                ),
            }}
            icon="🔗"
          />
        ) : (
          <ContainerSkeleton />
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};

export default DelegationsPayoutsContainer;
