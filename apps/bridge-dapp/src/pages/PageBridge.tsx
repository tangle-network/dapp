import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, ChainConfig } from '@webb-tools/dapp-config';
import { useScrollActions } from '@webb-tools/responsive-utils';
import {
  ErrorFallback,
  TabContent,
  TabTrigger,
  TabsList,
  TabsRoot,
  TransactionQueueCard,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { useCallback, useMemo, useState } from 'react';

import { useNoteAccount, useTxQueue } from '@webb-tools/react-hooks';
import { Note } from '@webb-tools/sdk-core';
import {
  EducationCard,
  InteractiveFeedbackView,
  WalletModal,
} from '../components';
import { FilterButton, ManageButton } from '../components/tables';
import {
  CreateAccountModal,
  DeleteNotesModal,
  UploadSpendNoteModal,
} from '../containers';
import { DepositContainer } from '../containers/DepositContainer';
import { TransferContainer } from '../containers/TransferContainer';
import { WithdrawContainer } from '../containers/WithdrawContainer';
import {
  ShieldedAssetsTableContainer,
  SpendNotesTableContainer,
} from '../containers/note-account-tables';
import { NoteAccountTableContainerProps } from '../containers/note-account-tables/types';
import {
  useShieldedAssets,
  useSpendNotes,
  useTryAnotherWalletWithView,
} from '../hooks';
import { downloadNotes } from '../utils';
import { ErrorBoundary } from '@sentry/react';

const PageBridge = () => {
  // State for the tabs
  const [activeTab, setActiveTab] = useState<
    'Deposit' | 'Withdraw' | 'Transfer'
  >('Deposit');

  const { customMainComponent } = useWebbUI();
  const { activeFeedback, noteManager } = useWebContext();

  const { smoothScrollToTop } = useScrollActions();

  const { txPayloads } = useTxQueue();

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
    'shielded-assets' | 'available-spend-notes'
  >('shielded-assets');

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

  const isDisplayTxQueueCard = useMemo(
    () => txPayloads.length > 0,
    [txPayloads]
  );

  const sharedBridgeTabContainerProps = useMemo(
    () => ({
      defaultDestinationChain: defaultDestinationChain,
      defaultFungibleCurrency: defaultFungibleCurrency,
      onTryAnotherWallet: onTryAnotherWallet,
    }),
    [defaultDestinationChain, defaultFungibleCurrency, onTryAnotherWallet]
  );

  return (
    <>
      <div className="w-full">
        <ErrorBoundary fallback={<ErrorFallback className="mx-auto mt-4" />}>
          <div
            className={cx(
              ' p-9',
              "bg-[url('assets/bridge-bg.png')] dark:bg-[url('assets/bridge-dark-bg.png')]",
              'bg-center object-fill bg-no-repeat bg-cover'
            )}
          >
            <div className="max-w-[1160px] mx-auto grid grid-cols-[minmax(550px,_562px)_1fr] items-start gap-9">
              {customMainComponent}

              {/** Bridge tabs */}
              <TabsRoot
                value={activeTab}
                onValueChange={(nextTab) =>
                  setActiveTab(nextTab as typeof activeTab)
                }
                // The customMainComponent alters the global mainComponent for display.
                // Therfore, if the customMainComponent exists (input selected) then hide the base component.
                className={cx(
                  'min-w-[550px] bg-mono-0 dark:bg-mono-180 p-4 rounded-lg space-y-4 grow',
                  customMainComponent ? 'hidden' : 'block'
                )}
              >
                <TabsList aria-label="bridge action" className="mb-4">
                  <TabTrigger value="Deposit">Deposit</TabTrigger>
                  <TabTrigger value="Transfer">Transfer</TabTrigger>
                  <TabTrigger value="Withdraw">Withdraw</TabTrigger>
                </TabsList>
                <TabContent value="Deposit">
                  <DepositContainer {...sharedBridgeTabContainerProps} />
                </TabContent>
                <TabContent value="Transfer">
                  <TransferContainer {...sharedBridgeTabContainerProps} />
                </TabContent>
                <TabContent value="Withdraw">
                  <WithdrawContainer {...sharedBridgeTabContainerProps} />
                </TabContent>
              </TabsRoot>

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
          <TabsRoot
            defaultValue="shielded-assets"
            className="max-w-[1160px] mx-auto mt-4 space-y-4"
            onValueChange={(val) => setActiveTable(val as typeof activeTable)}
          >
            <div className="flex items-center justify-between mb-4">
              {/** Tabs buttons */}
              <TabsList
                aria-label="account-statistics-table"
                className="space-x-3.5 py-4"
              >
                <TabTrigger
                  isDisableStyle
                  value="shielded-assets"
                  className="h5 radix-state-active:font-bold text-mono-100 radix-state-active:text-mono-200 dark:radix-state-active:text-mono-0"
                >
                  Shielded Assets
                </TabTrigger>
                <TabTrigger
                  isDisableStyle
                  value="available-spend-notes"
                  className="h5 radix-state-active:font-bold text-mono-100 radix-state-active:text-mono-200 dark:radix-state-active:text-mono-0"
                >
                  Available Spend Notes
                </TabTrigger>
              </TabsList>

              {/** Right buttons (manage and filter) */}
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
                    activeTable === 'shielded-assets'
                      ? 'Search asset'
                      : 'Search spend note'
                  }
                  globalSearchText={globalSearchText}
                  setGlobalSearchText={setGlobalSearchText}
                  clearAllFilters={clearAllFilters}
                />
              </div>
            </div>

            <TabContent value="shielded-assets">
              <ShieldedAssetsTableContainer
                data={shieldedAssetsFilteredTableData}
                {...sharedNoteAccountTableContainerProps}
              />
            </TabContent>
            <TabContent value="available-spend-notes">
              <SpendNotesTableContainer
                data={spendNotesFilteredTableData}
                {...sharedNoteAccountTableContainerProps}
              />
            </TabContent>
          </TabsRoot>
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

export default PageBridge;
