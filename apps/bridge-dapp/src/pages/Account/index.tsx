import type { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { useNoteAccount } from '@webb-tools/react-hooks/useNoteAccount';
import type { Note } from '@webb-tools/sdk-core';
import { TableAndChartTabs } from '@webb-tools/webb-ui-components/components/TableAndChartTabs';
import { TabContent } from '@webb-tools/webb-ui-components/components/Tabs';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { useCallback, useMemo, useState } from 'react';
import { FilterButton, ManageButton } from '../../components/tables';
import ReceiveModal from '../../components/ReceiveModal';
import { DeleteNotesModal } from '../../containers/DeleteNotesModal';
import { UploadSpendNoteModal } from '../../containers/UploadSpendNoteModal';
import {
  ShieldedAssetsTableContainer,
  SpendNotesTableContainer,
} from '../../containers/note-account-tables';
import type { NoteAccountTableContainerProps } from '../../containers/note-account-tables/types';
import { useShieldedAssets } from '../../hooks/useShieldedAssets';
import { useSpendNotes } from '../../hooks/useSpendNotes';
import { downloadNotes } from '../../utils/downloadNotes';
import AccountSummaryCard from './AccountSummaryCard';

const shieldedAssetsTab = 'Shielded Assets';
const spendNotesTab = 'Available Spend Notes';

const Account = () => {
  const [activeTable, setActiveTable] = useState<
    typeof shieldedAssetsTab | typeof spendNotesTab
  >(shieldedAssetsTab);

  const { notificationApi } = useWebbUI();
  const { allNotes, hasNoteAccount, allNotesInitialized } = useNoteAccount();

  const { uploadModalOpen, setUploadModalOpen, openUploadModal } =
    useNoteUploadModalProps();

  const { globalSearchText, selectedChains, ...restFilterProps } =
    useFilterProps();

  // Shielded assets table data
  const shieldedAssetsTableData = useShieldedAssets();

  // Spend notes table data
  const spendNotesTableData = useSpendNotes();

  const destinationChains = useMemo(() => {
    return shieldedAssetsTableData.map((asset) => asset.chain);
  }, [shieldedAssetsTableData]);

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

  const [deleteNotes, setDeleteNotes] = useState<Note[] | undefined>(undefined);

  const sharedNoteAccountTableContainerProps =
    useMemo<NoteAccountTableContainerProps>(
      () => ({
        onUploadSpendNote: openUploadModal,
        onDeleteNotesChange: (notes) => setDeleteNotes(notes),
        globalSearchText: globalSearchText,
      }),
      [globalSearchText, openUploadModal]
    );

  if (!hasNoteAccount || !allNotesInitialized) {
    return null;
  }

  return (
    <>
      <div className="mx-auto space-y-4">
        <div className="flex items-end justify-between gap-4">
          <AccountSummaryCard />
        </div>

        <TableAndChartTabs
          tabs={[shieldedAssetsTab, spendNotesTab]}
          className="py-4 space-y-4"
          onValueChange={(val) => setActiveTable(val as typeof activeTable)}
          filterComponent={
            <RightButtonsContainer
              onUpload={openUploadModal}
              onDownloadAllNotes={handleDownloadAllNotes}
              destChains={destinationChains}
              activeTable={activeTable}
              selectedChains={selectedChains}
              globalSearchText={globalSearchText}
              {...restFilterProps}
            />
          }
        >
          {/* Shielded Assets Table */}
          <TabContent value={shieldedAssetsTab}>
            <ShieldedAssetsTableContainer
              data={getFilterData(selectedChains, shieldedAssetsTableData)}
              {...sharedNoteAccountTableContainerProps}
            />
          </TabContent>

          {/* Spend Notes Table */}
          <TabContent value={spendNotesTab}>
            <SpendNotesTableContainer
              data={getFilterData(selectedChains, spendNotesTableData)}
              {...sharedNoteAccountTableContainerProps}
            />
          </TabContent>
        </TableAndChartTabs>
      </div>

      <DeleteNotesModal
        notes={deleteNotes}
        setNotes={(notes) => setDeleteNotes(notes)}
      />

      <UploadSpendNoteModal
        isOpen={uploadModalOpen}
        setIsOpen={(isOpen) => setUploadModalOpen(isOpen)}
      />

      <ReceiveModal />
    </>
  );
};

export default Account;

/** @internal */
function useNoteUploadModalProps() {
  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const openUploadModal = useCallback(() => {
    setUploadModalOpen(true);
  }, []);

  const closeUploadModal = useCallback(() => {
    setUploadModalOpen(false);
  }, []);

  return {
    uploadModalOpen,
    setUploadModalOpen,
    openUploadModal,
    closeUploadModal,
  };
}

/** @internal */
type SelectedChain = 'all' | [string, ChainConfig][];

/** @internal */
function useFilterProps() {
  const [selectedChains, setSelectedChains] = useState<SelectedChain>('all');

  const [globalSearchText, setGlobalSearchText] = useState('');

  const clearAllFilters = useCallback(() => {
    setSelectedChains('all');
    setGlobalSearchText('');
  }, []);

  return {
    selectedChains,
    setSelectedChains,
    globalSearchText,
    setGlobalSearchText,
    clearAllFilters,
  };
}

/** @internal */
function RightButtonsContainer(
  props: {
    onUpload: () => void;
    onDownloadAllNotes: () => void;
    destChains: string[];
    activeTable: typeof shieldedAssetsTab | typeof spendNotesTab;
  } & ReturnType<typeof useFilterProps>
) {
  const {
    onUpload,
    onDownloadAllNotes,
    destChains,
    activeTable,
    ...filterProps
  } = props;

  return (
    <div className="items-center hidden space-x-2 md:flex">
      <ManageButton onUpload={onUpload} onDownload={onDownloadAllNotes} />
      <FilterButton
        destinationChains={destChains}
        searchPlaceholder={
          activeTable === 'Shielded Assets'
            ? 'Search asset'
            : 'Search spend note'
        }
        {...filterProps}
      />
    </div>
  );
}

/** @internal */
function getFilterData<T extends Array<{ chain: string }>>(
  selectedChains: SelectedChain,
  data: T
): T {
  if (selectedChains === 'all') {
    return data;
  }

  return data.filter((asset) =>
    selectedChains.some(
      (chain) => chain['1'].name.toLowerCase() === asset.chain.toLowerCase()
    )
  ) as T;
}
