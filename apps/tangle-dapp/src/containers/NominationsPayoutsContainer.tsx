import {
  useConnectWallet,
  useWebContext,
} from '@tangle-network/api-provider-environment';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import {
  ActionsDropdown,
  Button,
  TabContent,
  TableAndChartTabs,
  toSubstrateAddress,
} from '@tangle-network/ui-components';
import { TANGLE_DOCS_URL } from '@tangle-network/ui-components/constants';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

import { ContainerSkeleton } from '../components';
import useNominations from '../data/nomination/useNominations';
import useIsBondedOrNominating from '../data/staking/useIsBondedOrNominating';
import useQueryParamKey from '../hooks/useQueryParamKey';
import {
  DelegationsAndPayoutsTab as NominationsAndPayoutsTab,
  QueryParamKey,
} from '../types';
import { DelegateTxContainer } from './DelegateTxContainer';
import { UpdateNominationsTxContainer } from './UpdateNominationsTxContainer';
import { UpdatePayeeTxContainer } from './UpdatePayeeTxContainer';
import PayoutsTable from '../components/PayoutsTable';
import PayoutAllTxModal from './PayoutAllTxModal';
import NominationsTable from '../components/nomination/NominationsTable';
import StopNominationTxModal from './StopNominationTxModal';

import useSWR from 'swr';
import { getPayouts } from '../data/payouts/getPayouts';
import { useClaimedEras } from '../hooks/useClaimedEras';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import filterClaimedPayouts from '../data/payouts/filterClaimedPayouts';
import useAgnosticAccountInfo from '@tangle-network/tangle-shared-ui/hooks/useAgnosticAccountInfo';

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
  const { toggleModal } = useConnectWallet();
  const tableRef = useRef<HTMLDivElement>(null);
  const { activeAccount, loading, isConnecting } = useWebContext();
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isPayoutAllModalOpen, setIsPayoutAllModalOpen] = useState(false);
  const [isUpdatePayeeModalOpen, setIsUpdatePayeeModalOpen] = useState(false);

  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);
  const nativeTokenSymbol = useNetworkStore((store) => store.nativeTokenSymbol);

  const { isEvm, evmAddress, substrateAddress } = useAgnosticAccountInfo();

  const userSubstrateAddress =
    isEvm && evmAddress ? toSubstrateAddress(evmAddress) : substrateAddress;

  const {
    data: payoutsData,
    isLoading: payoutsIsLoading,
    mutate: mutatePayouts,
  } = useSWR(
    ['payouts', userSubstrateAddress, rpcEndpoint, nativeTokenSymbol],
    ([, address, rpcEndpoint, nativeTokenSymbol]) =>
      getPayouts(address, rpcEndpoint, nativeTokenSymbol),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 5000,
      dedupingInterval: 5000,
    },
  );

  const { getClaimedEras, claimedErasByValidator } = useClaimedEras();

  const unclaimedPayouts = useMemo(() => {
    return filterClaimedPayouts(
      payoutsData?.payouts,
      claimedErasByValidator,
      getClaimedEras,
    );
  }, [payoutsData, claimedErasByValidator, getClaimedEras]);

  const validatorsAndEras = useMemo(() => {
    if (!unclaimedPayouts.length) return [];

    return unclaimedPayouts.map((payout) => ({
      validator: payout.validator.address || '',
      eras: payout.eras,
    }));
  }, [unclaimedPayouts]);

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

  const currentNominationAddresses = useMemo(() => {
    if (nomineesOpt === null) {
      return null;
    }

    return nomineesOpt.map((nominees) =>
      nominees.map((nominee) => nominee.address),
    );
  }, [nomineesOpt]);

  // Scroll to the table when the tab changes, or when the page
  // is first loaded with a tab query parameter present.
  useEffect(() => {
    if (queryParamsTab === null) {
      return;
    }

    tableRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queryParamsTab]);

  return (
    <div ref={tableRef}>
      <TableAndChartTabs
        value={activeTab}
        onValueChange={(tabString) => setActiveTab(assertTab(tabString))}
        tabs={[...Object.values(NominationsAndPayoutsTab)]}
        headerClassName="w-full overflow-x-auto"
        additionalActionsCmp={
          activeAccount?.address && isBondedOrNominating ? (
            activeTab === NominationsAndPayoutsTab.NOMINATIONS ? (
              <ManageNominationsButton
                onUpdateNominations={() =>
                  setIsUpdateNominationsModalOpen(true)
                }
                onChangeRewardDestination={() =>
                  setIsUpdatePayeeModalOpen(true)
                }
                onStopNomination={() => setIsStopNominationModalOpen(true)}
              />
            ) : (
              <Button
                variant="utility"
                size="sm"
                isDisabled={unclaimedPayouts.length === 0}
                onClick={() => setIsPayoutAllModalOpen(true)}
              >
                Payout All
              </Button>
            )
          ) : null
        }
      >
        {/* Nominations Table */}
        <TabContent value={NominationsAndPayoutsTab.NOMINATIONS}>
          {!activeAccount ? (
            <TableStatus
              title="Wallet Not Connected"
              description="Connect your wallet to view and manage your nominations."
              buttonText="Connect"
              buttonProps={{
                isLoading: loading || isConnecting,
                loadingText: isConnecting ? 'Connecting' : 'Loading',
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
              description="Connect your wallet to view and request your nomination payouts."
              buttonText="Connect"
              buttonProps={{
                isLoading: loading || isConnecting,
                loadingText: isConnecting ? 'Connecting' : undefined,
                onClick: () => toggleModal(true),
              }}
              icon="🔗"
            />
          ) : payoutsIsLoading ? (
            <ContainerSkeleton />
          ) : unclaimedPayouts.length === 0 ? (
            <TableStatus
              title={
                !isBondedOrNominating
                  ? 'Ready to Get Rewarded?'
                  : 'Awaiting Rewards'
              }
              description={
                !isBondedOrNominating
                  ? "It looks like you haven't nominated any validators yet. Start by choosing a validator to support and earn rewards!"
                  : `You've successfully nominated validators and your rewards will be available soon. Check back to see your updated payout status. Expecting to see some past payouts here? Try selecting a larger era range.`
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
            <PayoutsTable
              data={unclaimedPayouts}
              pageSize={PAGE_SIZE}
              onPayoutSuccess={() => {
                mutatePayouts();
              }}
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
        currentNominations={
          currentNominationAddresses?.value?.map(
            (addr) => addr as SubstrateAddress,
          ) ?? []
        }
      />

      <UpdatePayeeTxContainer
        isModalOpen={isUpdatePayeeModalOpen}
        setIsModalOpen={setIsUpdatePayeeModalOpen}
      />

      <StopNominationTxModal
        isModalOpen={isStopNominationModalOpen}
        setIsModalOpen={setIsStopNominationModalOpen}
      />

      <PayoutAllTxModal
        isModalOpen={isPayoutAllModalOpen}
        setIsModalOpen={setIsPayoutAllModalOpen}
        validatorsAndEras={validatorsAndEras}
        payouts={unclaimedPayouts}
        onSuccess={() => {
          mutatePayouts();
        }}
      />
    </div>
  );
};

type ManageNominationsButtonProps = {
  onUpdateNominations: () => void;
  onChangeRewardDestination: () => void;
  onStopNomination: () => void;
};

/** @internal */
const ManageNominationsButton: FC<ManageNominationsButtonProps> = ({
  onUpdateNominations,
  onChangeRewardDestination,
  onStopNomination,
}) => {
  return (
    <div className="flex items-center space-x-2">
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
};

export default DelegationsPayoutsContainer;
