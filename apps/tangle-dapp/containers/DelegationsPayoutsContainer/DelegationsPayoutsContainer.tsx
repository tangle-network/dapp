'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import {
  ActionsDropdown,
  Button,
  notificationApi,
  TabContent,
  TableAndChartTabs,
  useCheckMobile,
} from '@webb-tools/webb-ui-components';
import { type FC, useEffect, useMemo, useState } from 'react';

import { ContainerSkeleton, TableStatus } from '../../components';
import { isNominatorFirstTimeNominator } from '../../constants';
import useDelegations from '../../data/DelegationsPayouts/useDelegations';
import usePayouts from '../../data/DelegationsPayouts/usePayouts';
import { Payout } from '../../types';
import { convertToSubstrateAddress } from '../../utils';
import { DelegateTxContainer } from '../DelegateTxContainer';
import { PayoutAllTxContainer } from '../PayoutAllTxContainer';
import { StopNominationTxContainer } from '../StopNominationTxContainer';
import { UpdateNominationsTxContainer } from '../UpdateNominationsTxContainer';
import { UpdatePayeeTxContainer } from '../UpdatePayeeTxContainer';
import DelegatorTableContainer from './DelegatorTableContainer';
import PayoutTableContainer from './PayoutTableContainer';

const pageSize = 10;
const delegationsTableTab = 'Nominations';
const payoutsTableTab = 'Payouts';

const DelegationsPayoutsContainer: FC = () => {
  const { activeAccount, loading } = useWebContext();
  const [activeTab, setActiveTab] = useState(delegationsTableTab);

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [updatedPayouts, setUpdatedPayouts] = useState<Payout[]>([]);

  const [isFirstTimeNominator, setIsFirstTimeNominator] = useState(true);
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isUpdateNominationsModalOpen, setIsUpdateNominationsModalOpen] =
    useState(false);
  const [isUpdatePayeeModalOpen, setIsUpdatePayeeModalOpen] = useState(false);
  const [isStopNominationModalOpen, setIsStopNominationModalOpen] =
    useState(false);
  const [isPayoutAllModalOpen, setIsPayoutAllModalOpen] = useState(false);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    return convertToSubstrateAddress(activeAccount.address);
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

  const { data: payoutsData, isLoading: payoutsIsLoading } =
    usePayouts(substrateAddress);

  useEffect(() => {
    if (updatedPayouts.length > 0) {
      setPayouts(updatedPayouts);
    } else if (payoutsData && payoutsData.payouts) {
      setPayouts(payoutsData.payouts);
    }
  }, [payoutsData, updatedPayouts]);

  const validatorAndEras = useMemo(() => {
    if (payouts) {
      return payouts.map((payout) => ({
        validatorAddress: payout.validator.address,
        era: payout.era.toString(),
      }));
    }

    return [];
  }, [payouts]);

  useEffect(() => {
    if (!activeAccount?.address) {
      setUpdatedPayouts([]);
    }
  }, [activeAccount?.address]);

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
            activeTab === delegationsTableTab ? (
              <ManageButtonContainer
                onUpdateNominations={() =>
                  setIsUpdateNominationsModalOpen(true)
                }
                onChangeRewardDestination={() =>
                  setIsUpdatePayeeModalOpen(true)
                }
                onStopNomination={() => setIsStopNominationModalOpen(true)}
              />
            ) : (
              <div>
                <Button
                  variant="utility"
                  onClick={() => setIsPayoutAllModalOpen(true)}
                >
                  Payout All
                </Button>
              </div>
            )
          ) : null
        }
        onValueChange={(tab) => setActiveTab(tab)}
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
                onClick: () => toggleModal(true),
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
                onClick: () => toggleModal(true),
              }}
              icon="🔗"
            />
          ) : payoutsIsLoading ? (
            <ContainerSkeleton />
          ) : !payoutsData || payouts.length === 0 ? (
            <TableStatus
              title="Ready to Get Rewarded?"
              description="It looks like you haven't nominated any tokens yet. Start by choosing a validator to support and earn rewards!"
              buttonText="Nominate"
              buttonProps={{
                onClick: () => setIsDelegateModalOpen(true),
              }}
              icon="🔍"
            />
          ) : (
            <PayoutTableContainer
              value={payouts}
              pageSize={pageSize}
              updateValue={setUpdatedPayouts}
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

      <StopNominationTxContainer
        isModalOpen={isStopNominationModalOpen}
        setIsModalOpen={setIsStopNominationModalOpen}
      />

      <PayoutAllTxContainer
        isModalOpen={isPayoutAllModalOpen}
        setIsModalOpen={setIsPayoutAllModalOpen}
        validatorsAndEras={validatorAndEras}
        payouts={payouts}
        updatePayouts={setUpdatedPayouts}
      />
    </>
  );
};

export default DelegationsPayoutsContainer;

/** @internal */
function ManageButtonContainer(props: {
  onUpdateNominations: () => void;
  onChangeRewardDestination: () => void;
  onStopNomination: () => void;
}) {
  const { onUpdateNominations, onChangeRewardDestination, onStopNomination } =
    props;

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
            label: 'Stop Nominations',
            onClick: onStopNomination,
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
