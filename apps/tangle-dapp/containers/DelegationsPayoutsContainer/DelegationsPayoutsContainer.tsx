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
import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import { ContainerSkeleton, TableStatus } from '../../components';
import useDelegations from '../../data/DelegationsPayouts/useDelegations';
import usePayouts from '../../data/DelegationsPayouts/usePayouts';
import useIsFirstTimeNominatorSubscription from '../../hooks/useIsFirstTimeNominatorSubscription';
import useQueryParamKey from '../../hooks/useQueryParamKey';
import { DelegationsAndPayoutsTab, Payout, QueryParamKey } from '../../types';
import { convertToSubstrateAddress } from '../../utils';
import { DelegateTxContainer } from '../DelegateTxContainer';
import { PayoutAllTxContainer } from '../PayoutAllTxContainer';
import { StopNominationTxContainer } from '../StopNominationTxContainer';
import { UpdateNominationsTxContainer } from '../UpdateNominationsTxContainer';
import { UpdatePayeeTxContainer } from '../UpdatePayeeTxContainer';
import DelegatorTableContainer from './DelegatorTableContainer';
import PayoutTableContainer from './PayoutTableContainer';

const PAGE_SIZE = 10;

function assertTab(tab: string): DelegationsAndPayoutsTab {
  if (
    !Object.values(DelegationsAndPayoutsTab).includes(
      tab as DelegationsAndPayoutsTab
    )
  ) {
    throw new Error(`Invalid tab: ${tab}`);
  }

  return tab as DelegationsAndPayoutsTab;
}

const DelegationsPayoutsContainer: FC = () => {
  const { value: queryParamsTab } = useQueryParamKey(
    QueryParamKey.DelegationsAndPayoutsTab
  );

  const tableRef = useRef<HTMLDivElement>(null);
  const { activeAccount, loading } = useWebContext();

  // Allow other pages to link directly to the payouts tab.
  // Default to the nominations tab if no matching browser URL
  // hash is present.
  const [activeTab, setActiveTab] = useState(
    queryParamsTab ?? DelegationsAndPayoutsTab.Nominations
  );

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

  // Scroll to the table when the tab changes, or when the page
  // is first loaded with a tab query parameter present.
  useEffect(() => {
    if (queryParamsTab === null) {
      return;
    }

    tableRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queryParamsTab]);

  useEffect(() => {
    if (updatedPayouts.length > 0) {
      setPayouts(updatedPayouts);
    } else if (payoutsData && payoutsData.payouts) {
      setPayouts(payoutsData.payouts);
    }
  }, [payoutsData, updatedPayouts]);

  const validatorAndEras = useMemo(
    () =>
      payouts.map((payout) => ({
        validatorAddress: payout.validator.address,
        era: payout.era.toString(),
      })),
    [payouts]
  );

  // Clear the updated payouts when the active account changes,
  // and the user is no longer logged in.
  useEffect(() => {
    if (!activeAccount?.address) {
      setUpdatedPayouts([]);
    }
  }, [activeAccount?.address]);

  const { isMobile } = useCheckMobile();

  const { toggleModal } = useConnectWallet();

  return (
    <div ref={tableRef}>
      <TableAndChartTabs
        value={activeTab}
        onValueChange={(tabString) => setActiveTab(assertTab(tabString))}
        tabs={[...Object.values(DelegationsAndPayoutsTab)]}
        headerClassName="w-full overflow-x-auto"
        filterComponent={
          activeAccount?.address && !isFirstTimeNominator ? (
            activeTab === DelegationsAndPayoutsTab.Nominations ? (
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
      >
        {/* Delegations Table */}
        <TabContent value={DelegationsAndPayoutsTab.Nominations}>
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
              pageSize={PAGE_SIZE}
            />
          ) : null}
        </TabContent>

        {/* Payouts Table */}
        <TabContent value={DelegationsAndPayoutsTab.Payouts} aria-disabled>
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
              pageSize={PAGE_SIZE}
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
    </div>
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
