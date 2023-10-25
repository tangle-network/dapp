import { ErrorBoundary } from '@sentry/react';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { ChainConfig } from '@webb-tools/dapp-config';
import { ArrowRightUp } from '@webb-tools/icons';
import { useNoteAccount } from '@webb-tools/react-hooks';
import { Note } from '@webb-tools/sdk-core';
import {
  ErrorFallback,
  TabContent,
  TableAndChartTabs,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { HUBBLE_STATS_URL } from '@webb-tools/webb-ui-components/constants';
import cx from 'classnames';
import { FC, useCallback, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { InteractiveFeedbackView, WalletModal } from '../../../components';
import { FilterButton, ManageButton } from '../../../components/tables';
import {
  CreateAccountModal,
  DeleteNotesModal,
  UploadSpendNoteModal,
} from '../../../containers';
import {
  ShieldedAssetsTableContainer,
  SpendNotesTableContainer,
} from '../../../containers/note-account-tables';
import { NoteAccountTableContainerProps } from '../../../containers/note-account-tables/types';
import {
  useShieldedAssets,
  useSpendNotes,
  useTryAnotherWalletWithView,
} from '../../../hooks';
import { BridgeTabType } from '../../../types';
import { downloadNotes } from '../../../utils';

const shieldedAssetsTab = 'Shielded Assets';
const spendNotesTab = 'Available Spend Notes';

const Bridge: FC = () => {
  // State for the tabs
  const [, setActiveTab] = useState<BridgeTabType>('Deposit');

  const { activeFeedback, noteManager } = useWebContext();

  // Upload modal state
  const [isUploadModalOpen, setUploadModalIsOpen] = useState(false);

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
        onDeleteNotesChange: (notes) => setDeleteNotes(notes),
        globalSearchText: globalSearchText,
      }),
      [handleChangeTab, handleOpenUploadModal, globalSearchText]
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
  const { TryAnotherWalletModal } = useTryAnotherWalletWithView();

  const noteAccountTabsRightButtons = useMemo(
    () => (
      <div className="items-center hidden space-x-2 md:flex">
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
      <ErrorBoundary fallback={<ErrorFallback className="mx-auto" />}>
        <div className="min-h-[var(--card-height)] flex flex-col mob:!flex-row justify-center">
          {/** Bridge tabs */}
          <Outlet />

          <a
            href={HUBBLE_STATS_URL}
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
          {/* <div>
              {isDisplayTxQueueCard && (
                <TransactionQueueCard
                  className="w-full mb-4 max-w-none"
                  transactions={txPayloads}
                />
              )}
              <EducationCard
                defaultOpen={!isDisplayTxQueueCard} // If there is a tx queue card, then don't open the education card by default
                currentTab={activeTab}
              />
            </div> */}
        </div>
      </ErrorBoundary>

      {/** Account stats table */}
      {noteManager && (
        <div className="mx-auto mt-6">
          <TableAndChartTabs
            tabs={[shieldedAssetsTab, spendNotesTab]}
            className="space-y-4"
            onValueChange={(val) => setActiveTable(val as typeof activeTable)}
            filterComponent={noteAccountTabsRightButtons}
          >
            {/* Shielded Assets Table */}
            <TabContent value={shieldedAssetsTab}>
              <ShieldedAssetsTableContainer
                data={shieldedAssetsFilteredTableData}
                {...sharedNoteAccountTableContainerProps}
              />
            </TabContent>

            {/* Spend Notes Table */}
            <TabContent value={spendNotesTab}>
              <SpendNotesTableContainer
                data={spendNotesFilteredTableData}
                {...sharedNoteAccountTableContainerProps}
              />
            </TabContent>
          </TableAndChartTabs>
        </div>
      )}

      {/** Last login */}

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
