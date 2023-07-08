import { useCallback, useMemo, useState } from 'react';
import { ErrorBoundary } from '@sentry/react';
import cx from 'classnames';
import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, ChainConfig } from '@webb-tools/dapp-config';
import { useNoteAccount, useScrollActions } from '@webb-tools/react-hooks';
import { Note } from '@webb-tools/sdk-core';
import {
  ErrorFallback,
  TabContent,
  TabTrigger,
  TableAndChartTabs,
  TabsList,
  TabsRoot,
  TransactionQueueCard,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { ArrowRightUp } from '@webb-tools/icons';
import { STATS_URL } from '@webb-tools/webb-ui-components/constants';
import {
  EducationCard,
  InteractiveFeedbackView,
  WalletModal,
} from '../../components';
import { FilterButton, ManageButton } from '../../components/tables';
import {
  CreateAccountModal,
  DeleteNotesModal,
  DepositContainer,
  TransferContainer,
  UploadSpendNoteModal,
  WithdrawContainer,
} from '../../containers';
import {
  ShieldedAssetsTableContainer,
  SpendNotesTableContainer,
} from '../../containers/note-account-tables';
import { NoteAccountTableContainerProps } from '../../containers/note-account-tables/types';
import {
  useShieldedAssets,
  useSpendNotes,
  useTryAnotherWalletWithView,
} from '../../hooks';
import { BridgeTabType } from '../../types';
import { downloadNotes } from '../../utils';

const Bridge = () => {
  // State for the tabs
  const [activeTab, setActiveTab] = useState<BridgeTabType>('Deposit');

  const { customMainComponent } = useWebbUI();
  const {
    activeFeedback,
    noteManager,
    txQueue: { txPayloads },
  } = useWebContext();

  const { smoothScrollToTop } = useScrollActions();

  // Upload modal state
  const [isUploadModalOpen, setUploadModalIsOpen] = useState(false);

  // Default state for destination chain and fungible currency
  // when action buttons are clicked in the note account table
  const [defaultDestinationChain, setDefaultDestinationChain] = useState<
    Chain | undefined
  >(undefined);
  const [defaultFungibleCurrency, setdefaultFungibleCurrency] = useState<
    Currency | undefined
  >(undefined);

  // Callback to update the default destination chain and fungible currency
  const updateDefaultDestinationChain = useCallback(
    (chain: Chain) => {
      smoothScrollToTop();
      setDefaultDestinationChain(chain);
    },
    [smoothScrollToTop]
  );

  const updatedefaultFungibleCurrency = useCallback((currency: Currency) => {
    setdefaultFungibleCurrency(currency);
  }, []);

  // Callback to open upload modal
  const handleOpenUploadModal = useCallback(() => {
    setUploadModalIsOpen(true);
  }, []);

  // Callback to change the active tab
  const handleChangeTab = useCallback(
    (tab: 'Deposit' | 'Withdraw' | 'Transfer') => {
      setActiveTab(tab);
    },
    []
  );

  const {
    allNotes,
    isOpenNoteAccountModal,
    isSuccessfullyCreatedNoteAccount,
    setOpenNoteAccountModal,
    setSuccessfullyCreatedNoteAccount,
  } = useNoteAccount();

  const { notificationApi } = useWebbUI();

  const [deleteNotes, setDeleteNotes] = useState<Note[] | undefined>(undefined);

  // download all notes
  const handleDownloadAllNotes = useCallback(async () => {
    if (!allNotes.size) {
      notificationApi({
        variant: 'error',
        message: 'No notes to download',
      });
      return;
    }

    // Serialize all notes to array of string
    const notes = Array.from(allNotes.values()).reduce((acc, curr) => {
      return acc.concat(curr);
    }, [] as Note[]);

    downloadNotes(notes);
  }, [allNotes, notificationApi]);

  const [globalSearchText, setGlobalSearchText] = useState('');

  const sharedNoteAccountTableContainerProps =
    useMemo<NoteAccountTableContainerProps>(
      () => ({
        onActiveTabChange: handleChangeTab,
        onUploadSpendNote: handleOpenUploadModal,
        onDefaultDestinationChainChange: updateDefaultDestinationChain,
        onDefaultFungibleCurrencyChange: updatedefaultFungibleCurrency,
        onDeleteNotesChange: (notes) => setDeleteNotes(notes),
        globalSearchText: globalSearchText,
      }),
      [
        handleChangeTab,
        handleOpenUploadModal,
        updateDefaultDestinationChain,
        updatedefaultFungibleCurrency,
        globalSearchText,
      ]
    );

  // Shielded assets table data
  const shieldedAssetsTableData = useShieldedAssets();

  // Spend notes table data
  const spendNotesTableData = useSpendNotes();

  const [activeTable, setActiveTable] = useState<
    'Shielded Assets' | 'Available Spend Notes'
  >('Shielded Assets');

  const destinationChains = useMemo(() => {
    return shieldedAssetsTableData.map((asset) => asset.chain);
  }, [shieldedAssetsTableData]);

  const [selectedChains, setSelectedChains] = useState<
    'all' | [string, ChainConfig][]
  >('all');

  const shieldedAssetsFilteredTableData = useMemo(() => {
    if (selectedChains === 'all') {
      return shieldedAssetsTableData;
    }
    return shieldedAssetsTableData.filter((asset) =>
      selectedChains.some(
        (chain: any) =>
          chain['1'].name.toLowerCase() === asset.chain.toLowerCase()
      )
    );
  }, [selectedChains, shieldedAssetsTableData]);

  const spendNotesFilteredTableData = useMemo(() => {
    if (selectedChains === 'all') {
      return spendNotesTableData;
    }
    return spendNotesTableData.filter((note) =>
      selectedChains.some(
        (chain: any) =>
          chain['1'].name.toLowerCase() === note.chain.toLowerCase()
      )
    );
  }, [selectedChains, spendNotesTableData]);

  const clearAllFilters = useCallback(() => {
    setSelectedChains('all');
    setGlobalSearchText('');
  }, []);

  // Try again for try another wallet link
  // in the token list
  const { TryAnotherWalletModal, onTryAnotherWallet } =
    useTryAnotherWalletWithView();

  const sharedBridgeTabContainerProps = useMemo(
    () => ({
      defaultDestinationChain: defaultDestinationChain,
      defaultFungibleCurrency: defaultFungibleCurrency,
      onTryAnotherWallet: onTryAnotherWallet,
    }),
    [defaultDestinationChain, defaultFungibleCurrency, onTryAnotherWallet]
  );

  const isDisplayTxQueueCard = useMemo(
    () => txPayloads.length > 0,
    [txPayloads]
  );

  const noteAccountTabs = useMemo(
    () => [
      {
        value: 'Shielded Assets',
        component: (
          <ShieldedAssetsTableContainer
            data={shieldedAssetsFilteredTableData}
            {...sharedNoteAccountTableContainerProps}
          />
        ),
      },
      {
        value: 'Available Spend Notes',
        component: (
          <SpendNotesTableContainer
            data={spendNotesFilteredTableData}
            {...sharedNoteAccountTableContainerProps}
          />
        ),
      },
    ],
    [
      shieldedAssetsFilteredTableData,
      spendNotesFilteredTableData,
      sharedNoteAccountTableContainerProps,
    ]
  );

  const noteAccountTabsRightButtons = useMemo(
    () => (
      <div className="flex items-center space-x-2">
        <ManageButton
          onUpload={handleOpenUploadModal}
          onDownload={handleDownloadAllNotes}
        />
        <FilterButton
          destinationChains={destinationChains}
          setSelectedChains={setSelectedChains}
          selectedChains={selectedChains}
          searchPlaceholder={
            activeTable === 'Shielded Assets'
              ? 'Search asset'
              : 'Search spend note'
          }
          globalSearchText={globalSearchText}
          setGlobalSearchText={setGlobalSearchText}
          clearAllFilters={clearAllFilters}
        />
      </div>
    ),
    [
      activeTable,
      destinationChains,
      globalSearchText,
      selectedChains,
      clearAllFilters,
      setGlobalSearchText,
      handleOpenUploadModal,
      handleDownloadAllNotes,
    ]
  );

  return (
    <>
      <div className="w-full h-full">
        <ErrorBoundary fallback={<ErrorFallback className="mx-auto mt-4" />}>
          <div className={cx('min-h-[1100px] lg:min-h-fit', 'p-4 lg:p-9')}>
            <div className="lg:max-w-[1160px] mx-auto mob:grid mob:grid-cols-[minmax(550px,_562px)_1fr] items-start gap-9">
              {customMainComponent}

              {/** Bridge tabs */}
              <TabsRoot
                value={activeTab}
                onValueChange={(nextTab) =>
                  setActiveTab(nextTab as typeof activeTab)
                }
                // The customMainComponent alters the global mainComponent for display.
                // Therefore, if the customMainComponent exists (input selected) then hide the base component.
                className={cx(
                  'w-full lg:min-w-[550px] min-h-[710px] h-full bg-mono-0 dark:bg-mono-180 p-4 rounded-lg space-y-4 grow',
                  customMainComponent ? 'hidden' : 'block',
                  'flex flex-col'
                )}
              >
                <TabsList aria-label="bridge action" className="">
                  <TabTrigger value="Deposit">Deposit</TabTrigger>
                  <TabTrigger value="Transfer">Transfer</TabTrigger>
                  <TabTrigger value="Withdraw">Withdraw</TabTrigger>
                </TabsList>
                <TabContent className="flex flex-col grow" value="Deposit">
                  <DepositContainer {...sharedBridgeTabContainerProps} />
                </TabContent>
                <TabContent className="flex flex-col grow" value="Transfer">
                  <TransferContainer {...sharedBridgeTabContainerProps} />
                </TabContent>
                <TabContent className="flex flex-col grow" value="Withdraw">
                  <WithdrawContainer {...sharedBridgeTabContainerProps} />
                </TabContent>
              </TabsRoot>

              <a
                href={STATS_URL}
                target="_blank"
                rel="noreferrer"
                className={cx(
                  'mob:!hidden mt-9 ml-auto py-2 px-4 w-fit rounded-2xl',
                  'flex justify-end items-center',
                  'bg-[#ECF4FF] dark:bg-[#181F2B]'
                )}
              >
                <Typography variant="utility" className="!text-blue-50">
                  Explore Stats
                </Typography>
                <ArrowRightUp size="lg" className="!fill-blue-50" />
              </a>

              <div>
                {/** Transaction Queue Card */}
                {isDisplayTxQueueCard && (
                  <TransactionQueueCard
                    className="w-full mb-4 max-w-none"
                    transactions={txPayloads}
                  />
                )}

                {/** Education cards */}
                <EducationCard
                  defaultOpen={!isDisplayTxQueueCard} // If there is a tx queue card, then don't open the education card by default
                  currentTab={activeTab}
                />
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/** Account stats table */}
        {noteManager && (
          <div className="max-w-[1160px] mx-auto mt-4">
            <TableAndChartTabs
              tabs={noteAccountTabs}
              className="space-y-4"
              onValueChange={(val) => setActiveTable(val as typeof activeTable)}
              filterComponent={noteAccountTabsRightButtons}
            />
          </div>
        )}

        {/** Last login */}
      </div>

      <UploadSpendNoteModal
        isOpen={isUploadModalOpen}
        setIsOpen={(isOpen) => setUploadModalIsOpen(isOpen)}
      />

      <TryAnotherWalletModal />

      <DeleteNotesModal
        notes={deleteNotes}
        setNotes={(notes) => setDeleteNotes(notes)}
      />

      <WalletModal />

      <CreateAccountModal
        isOpen={isOpenNoteAccountModal}
        onOpenChange={(isOpen) => setOpenNoteAccountModal(isOpen)}
        isSuccess={isSuccessfullyCreatedNoteAccount}
        onIsSuccessChange={(success) =>
          setSuccessfullyCreatedNoteAccount(success)
        }
      />

      <InteractiveFeedbackView activeFeedback={activeFeedback} />
    </>
  );
};

export default Bridge;
