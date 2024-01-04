'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  ActionsDropdown,
  notificationApi,
  TabContent,
  TableAndChartTabs,
  useCheckMobile,
} from '@webb-tools/webb-ui-components';
import { TANGLE_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { type FC, useEffect, useMemo, useState } from 'react';

import { ContainerSkeleton, TableStatus } from '../../components';
import { isNominatorFirstTimeNominator } from '../../constants';
import useDelegations from '../../data/DelegationsPayouts/useDelegations';
import { convertEthereumToSubstrateAddress } from '../../utils';
import { DelegateTxContainer } from '../DelegateTxContainer';
import { UpdateNominationsTxContainer } from '../UpdateNominationsTxContainer';
import { UpdatePayeeTxContainer } from '../UpdatePayeeTxContainer';
import DelegatorTableContainer from './DelegatorTableContainer';

const pageSize = 5;
const delegationsTableTab = 'Nominations';
const payoutsTableTab = 'Payouts';

const DelegationsPayoutsContainer: FC = () => {
  const { activeAccount, loading } = useWebContext();

  const [isFirstTimeNominator, setIsFirstTimeNominator] = useState(true);
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isUpdateNominationsModalOpen, setIsUpdateNominationsModalOpen] =
    useState(false);
  const [isUpdatePayeeModalOpen, setIsUpdatePayeeModalOpen] = useState(false);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    return convertEthereumToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  const {
    data: delegatorsData,
    isLoading: delegatorsIsLoading,
    error: delegatorsError,
  } = useDelegations(substrateAddress);

  const currentNominations = useMemo(() => {
    if (!delegatorsData?.delegators) return [];

    return delegatorsData.delegators.map((delegator) => delegator.address);
  }, [delegatorsData?.delegators]);

  const { isMobile } = useCheckMobile();

  const { toggleModal } = useConnectWallet();

  useEffect(() => {
    try {
      const checkIfFirstTimeNominator = async () => {
        const isFirstTimeNominator = await isNominatorFirstTimeNominator(
          substrateAddress
        );

        setIsFirstTimeNominator(isFirstTimeNominator);
      };

      if (substrateAddress) {
        checkIfFirstTimeNominator();
      }
    } catch (error: any) {
      notificationApi({
        variant: 'error',
        message:
          error.message ||
          'Failed to check if the user is a first time nominator.',
      });
    }
  }, [substrateAddress]);

  if (delegatorsError) {
    notificationApi({
      variant: 'error',
      message: delegatorsError.message,
    });
  }

  return (
    <>
      <TableAndChartTabs
        tabs={[delegationsTableTab, payoutsTableTab]}
        headerClassName="w-full overflow-x-auto"
        filterComponent={
          activeAccount?.address && !isFirstTimeNominator ? (
            <RightButtonsContainer
              onUpdateNominations={() => setIsUpdateNominationsModalOpen(true)}
              onChangeRewardDestination={() => setIsUpdatePayeeModalOpen(true)}
            />
          ) : null
        }
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
              title="Ready to Explore Nominations?"
              description="It looks like you haven't nominated any validators yet. Start by choosing a validator to support and earn rewards!"
              buttonText="Nominate"
              buttonProps={{
                onClick: () => setIsDelegateModalOpen(true),
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

      <DelegateTxContainer
        isModalOpen={isDelegateModalOpen}
        setIsModalOpen={setIsDelegateModalOpen}
      />

      <UpdateNominationsTxContainer
        isModalOpen={isUpdateNominationsModalOpen}
        setIsModalOpen={setIsUpdateNominationsModalOpen}
        currentNominations={currentNominations}
      />

      <UpdatePayeeTxContainer
        isModalOpen={isUpdatePayeeModalOpen}
        setIsModalOpen={setIsUpdatePayeeModalOpen}
      />
    </>
  );
};

export default DelegationsPayoutsContainer;

/** @internal */
function RightButtonsContainer(props: {
  onUpdateNominations: () => void;
  onChangeRewardDestination: () => void;
}) {
  const { onUpdateNominations, onChangeRewardDestination } = props;

  return (
    <div className="items-center hidden space-x-2 md:flex">
      <ActionsDropdown
        buttonText="Manage"
        actionItems={[
          {
            label: 'Update Nominations',
            onClick: onUpdateNominations,
          },
          {
            label: 'Change Reward Destination',
            onClick: onChangeRewardDestination,
          },
        ]}
      />
    </div>
  );
}
