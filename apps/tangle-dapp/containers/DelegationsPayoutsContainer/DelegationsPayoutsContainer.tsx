'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { isSubstrateAddress } from '@webb-tools/dapp-types';
import {
  ActionsDropdown,
  Button,
  TabContent,
  TableAndChartTabs,
  useCheckMobile,
} from '@webb-tools/webb-ui-components';
import { type FC, useEffect, useMemo, useState } from 'react';

import { ContainerSkeleton, TableStatus } from '../../components';
import useDelegations from '../../data/DelegationsPayouts/useDelegations';
import usePayouts from '../../data/DelegationsPayouts/usePayouts';
import useIsFirstTimeNominatorSubscription from '../../hooks/useIsFirstTimeNominatorSubscription';
import { Payout } from '../../types';
import { AnchorLinkId } from '../../types';
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

  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isUpdateNominationsModalOpen, setIsUpdateNominationsModalOpen] =
    useState(false);
  const [isUpdatePayeeModalOpen, setIsUpdatePayeeModalOpen] = useState(false);
  const [isStopNominationModalOpen, setIsStopNominationModalOpen] =
    useState(false);
  const [isPayoutAllModalOpen, setIsPayoutAllModalOpen] = useState(false);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    if (isSubstrateAddress(activeAccount?.address))
      return activeAccount.address;

    return convertToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  const {
    data: delegatorsData,
    isLoading: delegatorsIsLoading,
    error: delegatorsError,
  } = useDelegations(substrateAddress);

  const { isFirstTimeNominator } =
    useIsFirstTimeNominatorSubscription(substrateAddress);

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

  return (
    <>
      <TableAndChartTabs
        id={AnchorLinkId.NominationAndPayouts}
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
                  isDisabled={payouts.length === 0}
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
          ) : !delegatorsError &&
            delegatorsData &&
            delegatorsData.delegators.length === 0 ? (
            <TableStatus
              title="Ready to Explore Nominations?"
              description="It looks like you haven't nominated any validators yet. Start by choosing a validator to support and earn rewards!"
              buttonText="Nominate"
              buttonProps={{
                onClick: () => setIsDelegateModalOpen(true),
              }}
              icon="🔍"
            />
          ) : !delegatorsError && delegatorsData ? (
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
