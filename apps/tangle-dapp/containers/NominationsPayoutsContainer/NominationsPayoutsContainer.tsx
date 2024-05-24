'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import {
  ActionsDropdown,
  Button,
  TabContent,
  TableAndChartTabs,
  useCheckMobile,
} from '@webb-tools/webb-ui-components';
import { TANGLE_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ContainerSkeleton,
  NominationsTable,
  PayoutTable,
  TableStatus,
} from '../../components';
import useNominations from '../../data/NominationsPayouts/useNominations';
import usePayouts from '../../data/NominationsPayouts/usePayouts';
import useIsBondedOrNominating from '../../data/staking/useIsBondedOrNominating';
import useApi from '../../hooks/useApi';
import useQueryParamKey from '../../hooks/useQueryParamKey';
import {
  DelegationsAndPayoutsTab as NominationsAndPayoutsTab,
  Payout,
  QueryParamKey,
} from '../../types';
import { DelegateTxContainer } from '../DelegateTxContainer';
import { PayoutAllTxContainer } from '../PayoutAllTxContainer';
import { StopNominationTxContainer } from '../StopNominationTxContainer';
import { UpdateNominationsTxContainer } from '../UpdateNominationsTxContainer';
import { UpdatePayeeTxContainer } from '../UpdatePayeeTxContainer';

const PAGE_SIZE = 10;

function assertTab(tab: string): NominationsAndPayoutsTab {
  if (
    !Object.values(NominationsAndPayoutsTab).includes(
      tab as NominationsAndPayoutsTab,
    )
  ) {
    throw new Error(`Invalid tab: ${tab}`);
  }

  return tab as NominationsAndPayoutsTab;
}

const DelegationsPayoutsContainer: FC = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  const { activeAccount, loading } = useWebContext();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [updatedPayouts, setUpdatedPayouts] = useState<Payout[]>([]);
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isPayoutAllModalOpen, setIsPayoutAllModalOpen] = useState(false);
  const [isUpdatePayeeModalOpen, setIsUpdatePayeeModalOpen] = useState(false);

  const { result: historyDepth } = useApi(
    useCallback(async (api) => api.consts.staking.historyDepth.toBn(), []),
  );

  const { result: progress } = useApi(
    useCallback((api) => api.derive.session.progress(), []),
  );

  const { result: epochDuration } = useApi(
    useCallback(async (api) => api.consts.babe.epochDuration.toNumber(), []),
  );

  const { value: queryParamsTab } = useQueryParamKey(
    QueryParamKey.DELEGATIONS_AND_PAYOUTS_TAB,
  );

  // Allow other pages to link directly to the payouts tab.
  // Default to the nominations tab if no matching browser URL
  // hash is present.
  const [activeTab, setActiveTab] = useState(
    queryParamsTab ?? NominationsAndPayoutsTab.NOMINATIONS,
  );

  const [isUpdateNominationsModalOpen, setIsUpdateNominationsModalOpen] =
    useState(false);

  const [isStopNominationModalOpen, setIsStopNominationModalOpen] =
    useState(false);

  const nomineesOpt = useNominations();
  const isBondedOrNominating = useIsBondedOrNominating();
  const { data: payoutsData, isLoading: payoutsIsLoading } = usePayouts();

  const currentNominationAddresses = useMemo(() => {
    if (nomineesOpt === null) {
      return null;
    }

    return nomineesOpt.map((nominees) =>
      nominees.map((nominee) => nominee.address),
    );
  }, [nomineesOpt]);

  const fetchedPayouts = useMemo(() => {
    if (payoutsData !== null) {
      setPayouts(payoutsData);
      return payoutsData;
    }
  }, [payoutsData]);

  useEffect(() => {
    if (updatedPayouts.length > 0) {
      setPayouts(updatedPayouts);
    }
  }, [updatedPayouts]);

  // Scroll to the table when the tab changes, or when the page
  // is first loaded with a tab query parameter present.
  useEffect(() => {
    if (queryParamsTab === null) {
      return;
    }

    tableRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queryParamsTab]);

  const validatorAndEras = useMemo(
    () =>
      payouts.map((payout) => ({
        validatorSubstrateAddress: payout.validator.address,
        era: payout.era,
      })),
    [payouts],
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
        tabs={[...Object.values(NominationsAndPayoutsTab)]}
        headerClassName="w-full overflow-x-auto"
        filterComponent={
          activeAccount?.address && isBondedOrNominating ? (
            activeTab === NominationsAndPayoutsTab.NOMINATIONS ? (
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
                  size="sm"
                  isDisabled={payoutsData.length === 0}
                  onClick={() => setIsPayoutAllModalOpen(true)}
                >
                  Payout All
                </Button>
              </div>
            )
          ) : null
        }
      >
        {/* Nominations Table */}
        <TabContent value={NominationsAndPayoutsTab.NOMINATIONS}>
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
          ) : nomineesOpt === null ? (
            <ContainerSkeleton />
          ) : nomineesOpt.value === null || nomineesOpt.value.length === 0 ? (
            <TableStatus
              title="Ready to Explore Nominations?"
              description="It looks like you haven't nominated any validators yet. Start by choosing a validator to support and earn rewards!"
              icon="🔍"
              buttonText="Nominate"
              buttonProps={{
                onClick: () => setIsDelegateModalOpen(true),
              }}
            />
          ) : (
            <NominationsTable
              nominees={nomineesOpt.value}
              pageSize={PAGE_SIZE}
            />
          )}
        </TabContent>

        {/* Payouts Table */}
        <TabContent value={NominationsAndPayoutsTab.PAYOUTS} aria-disabled>
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
          ) : isBondedOrNominating && payoutsIsLoading ? (
            <ContainerSkeleton />
          ) : fetchedPayouts && fetchedPayouts.length === 0 ? (
            <TableStatus
              title={
                !isBondedOrNominating
                  ? 'Ready to Get Rewarded?'
                  : 'Awaiting Rewards'
              }
              description={
                !isBondedOrNominating
                  ? "It looks like you haven't nominated any validators yet. Start by choosing a validator to support and earn rewards!"
                  : `You've successfully nominated validators and your rewards will be available soon. Check back to see your updated payout status.
                  `
              }
              buttonText={!isBondedOrNominating ? 'Nominate' : 'Learn More'}
              buttonProps={{
                onClick: () =>
                  !isBondedOrNominating
                    ? setIsDelegateModalOpen(true)
                    : window.open(TANGLE_DOCS_URL, '_blank'),
              }}
              icon={!isBondedOrNominating ? '🔍' : '⏳'}
            />
          ) : (
            <PayoutTable
              data={fetchedPayouts ?? []}
              pageSize={PAGE_SIZE}
              updateData={setUpdatedPayouts}
              sessionProgress={progress}
              historyDepth={historyDepth}
              epochDuration={epochDuration}
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
        // TODO: Need to pass down the explicit `Optional<T>` type here, instead of defaulting to `[]`, because that will lead to a situation where the lower component things the value is still loading and displays a loading state forever.
        currentNominations={currentNominationAddresses?.value ?? []}
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
    <div className="items-center space-x-2 flex">
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
