import { type FC, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Typography } from '@webb-tools/webb-ui-components';
import { DeleteBinIcon, UploadLine, Download } from '@webb-tools/icons';

import ActionsDropdown from '../../../components/ActionsDropdown';
import ClearTxHistoryModal from '../../../containers/ClearTxHistoryModal';
import UploadTxHistoryModal from '../../../containers/UploadTxHistoryModal';
import HiddenValueEye from '../../../components/HiddenValueEye';
import NoTx from '../NoTx';
import TxTableContainer from '../../../containers/TxTableContainer';
import { TxTableItemType } from '../../../containers/TxTableContainer/types';
import downloadTxHistory, {
  type DownloadTxType,
} from '../../../utils/downloadTxHistory';

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

const fakeDownloadData: DownloadTxType[] = [
  {
    hash: randEthereumAddress(),
    activity: 'deposit',
    amount: 0.1,
    from: randEthereumAddress(),
    to: randEthereumAddress(),
    blockExplorerUrl: '',
    fungibleTokenSymbol: 'webbETH',
    wrappableTokenSymbol: 'ETH',
    timestamp: 1699673249,
    relayerName: null,
    relayerFees: null,
    inputNoteSerializations: null,
    outputNoteSerializations: [
      'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00d412ffc8d7dc0237eb8fa9ef9fb3550cc0efdaa4d14267f6f6046989fc7a03/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=2',
    ],
  },
  {
    hash: randEthereumAddress(),
    activity: 'transfer',
    amount: 0.1,
    from: randEthereumAddress(),
    to: randEthereumAddress(),
    blockExplorerUrl: '',
    fungibleTokenSymbol: 'webbETH',
    wrappableTokenSymbol: 'ETH',
    timestamp: 1699673249,
    relayerName: 'webb_relayer.eth',
    relayerFees: 0.01,
    inputNoteSerializations: [
      'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00d412ffc8d7dc0237eb8fa9ef9fb3550cc0efdaa4d14267f6f6046989fc7a03/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=2',
      'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00893216e71881188829797e313bb49ff6ebbe14d414a1ddee16e3672331e470/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=0',
      'webb://v1:vanchor/1099511632777:1099511632779/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/000001000000138b:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:0066f9063d6b942655e8f30e45a2039581cbcecfff3f5c6619bf6a1699125b2a/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=0',
    ],
    outputNoteSerializations: [
      'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00d412ffc8d7dc0237eb8fa9ef9fb3550cc0efdaa4d14267f6f6046989fc7a03/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=2',
    ],
  },
  {
    hash: randEthereumAddress(),
    activity: 'withdraw',
    amount: 0.1,
    from: randEthereumAddress(),
    to: randEthereumAddress(),
    blockExplorerUrl: '',
    fungibleTokenSymbol: 'webbETH',
    wrappableTokenSymbol: 'ETH',
    timestamp: 1699673249,
    relayerName: 'webb_relayer.eth',
    relayerFees: 0.01,
    inputNoteSerializations: [
      'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00d412ffc8d7dc0237eb8fa9ef9fb3550cc0efdaa4d14267f6f6046989fc7a03/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=2',
      'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00893216e71881188829797e313bb49ff6ebbe14d414a1ddee16e3672331e470/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=0',
      'webb://v1:vanchor/1099511632777:1099511632779/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/000001000000138b:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:0066f9063d6b942655e8f30e45a2039581cbcecfff3f5c6619bf6a1699125b2a/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=0',
    ],
    outputNoteSerializations: [
      'webb://v1:vanchor/1099511632779:1099511632777/0x91eB86019FD8D7c5a9E31143D422850A13F670A3:0x91eB86019FD8D7c5a9E31143D422850A13F670A3/0000010000001389:000000000000000000000000000000000000000000000000002386f26fc10000:2d1240f8fa5e46117638375d3d3782720b9b56ed4e77b6fcff12b1e3b150e87e:00d412ffc8d7dc0237eb8fa9ef9fb3550cc0efdaa4d14267f6f6046989fc7a03/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbWETH&denom=18&amount=10000000000000000&index=2',
    ],
  },
];

const AccountTransactions: FC = () => {
  const txData: TxTableItemType[] = [
    ...fakeTxData,
    ...fakeTxData,
    ...fakeTxData,
    ...fakeTxData,
  ];

  const { uploadTxModalOpen, setUploadTxModalOpen, openUploadTxModal } =
    useUploadTxModal();
  const { clearTxModalOpen, setClearTxModalOpen, openClearTxModal } =
    useClearTxModal();

  const handleDownloadHistory = useCallback(() => {
    downloadTxHistory(fakeDownloadData);
  }, []);

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

        {txData.length > 0 ? (
          <TxTableContainer data={txData} pageSize={10} />
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
