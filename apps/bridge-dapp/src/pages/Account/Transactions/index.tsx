import { type FC, useState, useCallback } from 'react';
import { Typography } from '@webb-tools/webb-ui-components';

import { UploadSpendNoteModal } from '../../../containers/UploadSpendNoteModal';
import TxTableContainer from '../../../containers/TxTableContainer';
import { TxTableItemType } from '../../../containers/TxTableContainer/types';
import HiddenValueEye from '../../../components/HiddenValueEye';
import { ManageButton } from '../../../components/tables';
import NoTx from '../NoTx';

import { randNumber, randEthereumAddress } from '@ngneat/falso';
const fakeTxData: TxTableItemType[] = [
  {
    txHash: randEthereumAddress(),
    activity: 'transfer',
    tokenAmount: 0.01,
    tokenSymbol: 'ETH',
    sourceTypedChainId: 1099511627781,
    destinationTypedChainId: 1099511670889,
    recipient: randEthereumAddress(),
    timestamp: randNumber({ min: 1699244791 - 4 * 86400, max: 1699244791 }),
  },
  {
    txHash: randEthereumAddress(),
    activity: 'withdraw',
    tokenAmount: 0.1,
    tokenSymbol: 'ETH',
    sourceTypedChainId: 1099511627781,
    destinationTypedChainId: 1099511670889,
    recipient: randEthereumAddress(),
    timestamp: randNumber({ min: 1699244791 - 4 * 86400, max: 1699244791 }),
  },
  {
    txHash: randEthereumAddress(),
    activity: 'deposit',
    tokenAmount: 1,
    tokenSymbol: 'WETH',
    sourceTypedChainId: 1099511627781,
    destinationTypedChainId: 1099511670889,
    recipient: randEthereumAddress(),
    timestamp: randNumber({ min: 1699244791 - 4 * 86400, max: 1699244791 }),
  },
];

const AccountTransactions: FC = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const openUploadModal = useCallback(() => setUploadModalOpen(true), []);

  const txData: TxTableItemType[] = [
    ...fakeTxData,
    ...fakeTxData,
    ...fakeTxData,
    ...fakeTxData,
  ];

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
          <ManageButton onUpload={openUploadModal} />
        </div>

        {txData.length > 0 ? (
          <TxTableContainer data={txData} pageSize={10} />
        ) : (
          <NoTx />
        )}
      </div>

      <UploadSpendNoteModal
        isOpen={uploadModalOpen}
        setIsOpen={(isOpen) => setUploadModalOpen(isOpen)}
      />
    </>
  );
};

export default AccountTransactions;
