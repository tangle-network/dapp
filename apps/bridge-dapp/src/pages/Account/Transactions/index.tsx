import { type FC, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Typography } from '@webb-tools/webb-ui-components';
import { DeleteBinIcon } from '@webb-tools/icons';

import ActionsDropdown from '../../../components/ActionsDropdown';
import ClearTxHistoryModal from '../../../containers/ClearTxHistoryModal';
import HiddenValueEye from '../../../components/HiddenValueEye';
import NoTx from '../NoTx';
import TxTableContainer from '../../../containers/TxTableContainer';
import { TxTableItemType } from '../../../containers/TxTableContainer/types';

import { randNumber, randEthereumAddress } from '@ngneat/falso';
const fakeTxData: TxTableItemType[] = [
  {
    txHash: randEthereumAddress(),
    activity: 'transfer',
    tokenAmount: '-0.01',
    tokenSymbol: 'ETH',
    sourceTypedChainId: 1099511627781,
    destinationTypedChainId: 1099511670889,
    recipient: randEthereumAddress(),
    timestamp: randNumber({ min: 1699244791 - 4 * 86400, max: 1699244791 }),
  },
  {
    txHash: randEthereumAddress(),
    activity: 'withdraw',
    tokenAmount: '-0.10',
    tokenSymbol: 'ETH',
    sourceTypedChainId: 1099511627781,
    destinationTypedChainId: 1099511670889,
    recipient: randEthereumAddress(),
    timestamp: randNumber({ min: 1699244791 - 4 * 86400, max: 1699244791 }),
  },
  {
    txHash: randEthereumAddress(),
    activity: 'deposit',
    tokenAmount: '+1.00',
    tokenSymbol: 'WETH',
    sourceTypedChainId: 1099511627781,
    destinationTypedChainId: 1099511670889,
    recipient: randEthereumAddress(),
    timestamp: randNumber({ min: 1699244791 - 4 * 86400, max: 1699244791 }),
  },
];

const AccountTransactions: FC = () => {
  const txData: TxTableItemType[] = [
    ...fakeTxData,
    ...fakeTxData,
    ...fakeTxData,
    ...fakeTxData,
  ];

  const { clearTxModalOpen, setClearTxModalOpen, openClearTxModal } =
    useNoteUploadModalProps();

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
                label: 'Delete',
                icon: <DeleteBinIcon size="lg" />,
                onClick: openClearTxModal,
              },
            ]}
          />
        </div>

        {txData.length > 0 ? (
          <TxTableContainer data={txData} pageSize={10} />
        ) : (
          <NoTx />
        )}
      </div>

      <ClearTxHistoryModal
        isOpen={clearTxModalOpen}
        setIsOpen={setClearTxModalOpen}
      />

      <Outlet />
    </>
  );
};

export default AccountTransactions;

/** @internal */
function useNoteUploadModalProps() {
  // Upload modal state
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
