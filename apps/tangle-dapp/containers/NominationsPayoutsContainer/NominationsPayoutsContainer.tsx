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

import {
  ContainerSkeleton,
  NominationsTable,
  TableStatus,
} from '../../components';
import useNominations from '../../data/NominationsPayouts/useNominations';
import usePayouts from '../../data/NominationsPayouts/usePayouts';
import useIsBondedOrNominating from '../../data/staking/useIsBondedOrNominating';
import useNetworkState from '../../hooks/useNetworkState';
import useQueryParamKey from '../../hooks/useQueryParamKey';
import {
  DelegationsAndPayoutsTab as NominationsAndPayoutsTab,
  Payout,
  QueryParamKey,
} from '../../types';
import { toSubstrateAddress } from '../../utils';
import { DelegateTxContainer } from '../DelegateTxContainer';
import { PayoutAllTxContainer } from '../PayoutAllTxContainer';
import { StopNominationTxContainer } from '../StopNominationTxContainer';
import { UpdateNominationsTxContainer } from '../UpdateNominationsTxContainer';
import { UpdatePayeeTxContainer } from '../UpdatePayeeTxContainer';

const PAGE_SIZE = 10;

function assertTab(tab: string): NominationsAndPayoutsTab {
  if (
    !Object.values(NominationsAndPayoutsTab).includes(
      tab as NominationsAndPayoutsTab
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

  const { network } = useNetworkState();

  const { value: queryParamsTab } = useQueryParamKey(
    QueryParamKey.DELEGATIONS_AND_PAYOUTS_TAB
  );

  // Allow other pages to link directly to the payouts tab.
  // Default to the nominations tab if no matching browser URL
  // hash is present.
  const [activeTab, setActiveTab] = useState(
    queryParamsTab ?? NominationsAndPayoutsTab.NOMINATIONS
  );

  const [isUpdateNominationsModalOpen, setIsUpdateNominationsModalOpen] =
    useState(false);

  const [isStopNominationModalOpen, setIsStopNominationModalOpen] =
    useState(false);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '';
    } else if (isSubstrateAddress(activeAccount?.address)) {
      return activeAccount.address;
    }

    return toSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  const nomineesOpt = useNominations();
  const isBondedOrNominating = useIsBondedOrNominating();
  const { data: payoutsData } = usePayouts(substrateAddress);

  const currentNominationAddresses = useMemo(() => {
    if (nomineesOpt === null) {
      return null;
    }

    return nomineesOpt.map((nominees) =>
      nominees.map((nominee) => nominee.address)
    );
  }, [nomineesOpt]);

  // const { valueAfterMount: cachedPayouts } = useLocalStorage(
  //   LocalStorageKey.Payouts,
  //   true
  // );

  // const fetchedPayouts = useMemo(() => {
  //   if (payoutsData !== null) {
  //     return payoutsData.payouts;
  //   } else if (cachedPayouts) {
  //     return cachedPayouts[substrateAddress] ?? [];
  //   }
  // }, [cachedPayouts, payoutsData, substrateAddress]);

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
        validatorSubstrateAddress: payout.validator.address,
        era: payout.era,
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
          {/* {!activeAccount ? (
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
          ) : fetchedPayouts && fetchedPayouts.length === 0 ? (
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
            <PayoutTable
              data={fetchedPayouts ?? []}
              pageSize={PAGE_SIZE}
              updateData={setUpdatedPayouts}
            />
          )} */}

          <TableStatus
            icon="🚧"
            title="Payouts Coming Soon"
            description="The payouts feature for EVM and Substrate users is currently under active development. Meanwhile, Substrate users can view and manage payouts via the Polkadot/Substrate Portal."
            buttonText="Open Explorer"
            buttonProps={{
              // TODO: Ideally, get or build this URL straight from the network object instead of hardcoding it here.
              href: `https://polkadot.js.org/apps/?rpc=${network.wsRpcEndpoint}#/staking/payout`,
              target: '_blank',
            }}
          />
        </TabContent>
      </TableAndChartTabs>

      <DelegateTxContainer
        isModalOpen={isDelegateModalOpen}
        setIsModalOpen={setIsDelegateModalOpen}
      />

      <UpdateNominationsTxContainer
        isModalOpen={isUpdateNominationsModalOpen}
        setIsModalOpen={setIsUpdateNominationsModalOpen}
        // TODO: Need to pass down the explicit `Optional<T>` type here, instead of defaulting to `null`, because that will lead to a situation where the lower component things the value is still loading and displays a loading state forever.
        currentNominations={currentNominationAddresses?.value ?? null}
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
