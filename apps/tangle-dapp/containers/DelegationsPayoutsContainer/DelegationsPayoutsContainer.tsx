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
import { TANGLE_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { useMemo } from 'react';

import { ContainerSkeleton, TableStatus } from '../../components';
import useDelegations from '../../data/DelegationsPayouts/useDelegations';
import { convertEthereumToSubstrateAddress } from '../../utils';
import DelegatorTableContainer from './DelegatorTableContainer';

const pageSize = 5;
const delegationsTableTab = 'Delegations';
const payoutsTableTab = 'Payouts';

const DelegationsPayoutsContainer = () => {
  const { activeAccount, loading } = useWebContext();

  const nominatorSubstrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    return convertEthereumToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  const { data: delegatorsData, isLoading: delegatorsIsLoading } =
    useDelegations(nominatorSubstrateAddress);

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
        ) : delegatorsIsLoading ? (
          <ContainerSkeleton />
        ) : delegatorsData && delegatorsData.delegators.length === 0 ? (
          <TableStatus
            title="Ready to Explore Delegations?"
            description="It looks like you haven't delegated any tokens yet. Start by choosing a validator to support and earn rewards!"
            buttonText="Delegate"
            buttonProps={{
              isDisabled: true,
            }}
            icon="🔍"
          />
        ) : delegatorsData ? (
          <DelegatorTableContainer
            value={delegatorsData.delegators}
            pageSize={pageSize}
          />
        ) : null}
      </TabContent>

      {/* Payouts Table */}
      <TabContent value={payoutsTableTab} aria-disabled>
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
          <TableStatus
            title="Work In Progress"
            description="This feature is currently under development."
            buttonText="View Network"
            buttonProps={{
              onClick: () => window.open(TANGLE_STAKING_URL, '_blank'),
            }}
            icon="🔧"
          />
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};

export default DelegationsPayoutsContainer;
