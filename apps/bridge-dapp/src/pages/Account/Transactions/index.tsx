import { type FC, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { ActionsDropdown, Typography } from '@webb-tools/webb-ui-components';
import { DeleteBinIcon, UploadLine, Download } from '@webb-tools/icons';
import { useTxClientStorage } from '@webb-tools/api-provider-environment';

import ClearTxHistoryModal from '../../../containers/ClearTxHistoryModal';
import UploadTxHistoryModal from '../../../containers/UploadTxHistoryModal';
import HiddenValueEye from '../../../components/HiddenValueEye';
import NoTx from '../NoTx';
import TxTableContainer from '../../../containers/TxTableContainer';
import downloadTxHistory from '../../../utils/downloadTxHistory';

const AccountTransactions: FC = () => {
  const { transactions, clearTxHistory } = useTxClientStorage();

  const { uploadTxModalOpen, setUploadTxModalOpen, openUploadTxModal } =
    useUploadTxModal();
  const { clearTxModalOpen, setClearTxModalOpen, openClearTxModal } =
    useClearTxModal();

  const handleDownloadHistory = useCallback(() => {
    downloadTxHistory(transactions);
  }, [transactions]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography variant="h5" fw="bold">
              All Transactions
            </Typography>
            <HiddenValueEye />
          </div>
          <ActionsDropdown
            buttonText="Manage"
            actionItems={[
              {
                label: 'Upload',
                icon: <UploadLine size="lg" />,
                onClick: openUploadTxModal,
              },
              {
                label: 'Delete',
                icon: <DeleteBinIcon size="lg" />,
                onClick: openClearTxModal,
              },
            ]}
          />
        </div>

        {transactions.length > 0 ? (
          <TxTableContainer data={transactions} pageSize={10} />
        ) : (
          <NoTx />
        )}

        <div
          className="flex justify-end items-center gap-0.5 cursor-pointer"
          onClick={handleDownloadHistory}
        >
          <Typography
            variant="body1"
            className="text-mono-100 dark:text-mono-60 hover:underline"
          >
            [Download JSON Export]
          </Typography>
          <Download className="fill-mono-100 dark:fill-mono-60" />
        </div>
      </div>

      <UploadTxHistoryModal
        isOpen={uploadTxModalOpen}
        setIsOpen={setUploadTxModalOpen}
      />

      <ClearTxHistoryModal
        isOpen={clearTxModalOpen}
        setIsOpen={setClearTxModalOpen}
        clearTxHistory={clearTxHistory}
        downloadTxHistory={handleDownloadHistory}
      />

      <Outlet />
    </>
  );
};

export default AccountTransactions;

/** @internal */
function useUploadTxModal() {
  // Upload modal state
  const [uploadTxModalOpen, setUploadTxModalOpen] = useState(false);

  const openUploadTxModal = useCallback(() => {
    setUploadTxModalOpen(true);
  }, []);

  return {
    uploadTxModalOpen,
    setUploadTxModalOpen,
    openUploadTxModal,
  };
}

/** @internal */
function useClearTxModal() {
  const [clearTxModalOpen, setClearTxModalOpen] = useState(false);

  const openClearTxModal = useCallback(() => {
    setClearTxModalOpen(true);
  }, []);

  return {
    clearTxModalOpen,
    setClearTxModalOpen,
    openClearTxModal,
  };
}
