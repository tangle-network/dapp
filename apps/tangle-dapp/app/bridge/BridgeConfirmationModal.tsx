'use client';

import {
  Environment,
  getTransferStatusData,
  TransferStatusResponse,
} from '@buildwithsygma/sygma-sdk-core';
import { ArrowRight, ChainIcon, TokenIcon } from '@webb-tools/icons';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { TxName } from '../../constants';
import { useBridge } from '../../context/BridgeContext';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import useTxNotification from '../../hooks/useTxNotification';
import convertBnToDecimal from '../../utils/convertBnToDecimal';
import ensureError from '../../utils/ensureError';
import FeeDetails from './FeeDetails';
import useBridgeFee from './hooks/useBridgeFee';
import useBridgeTransfer from './hooks/useBridgeTransfer';
import useDecimals from './hooks/useDecimals';
import useSelectedToken from './hooks/useSelectedToken';

interface BridgeConfirmationModalProps {
  isOpen: boolean;
  handleClose: () => void;
}

const getStatus = async (
  txHash: string,
  env: Environment,
): Promise<TransferStatusResponse[]> => {
  const data = await getTransferStatusData(env, txHash);
  return data as TransferStatusResponse[];
};

const BridgeConfirmationModal: FC<BridgeConfirmationModalProps> = ({
  isOpen,
  handleClose,
}) => {
  const { notifyProcessing, notifySuccess, notifyError } = useTxNotification(
    TxName.BRIDGE_TRANSFER,
  );
  const {
    selectedSourceChain,
    selectedDestinationChain,
    amount,
    destinationAddress,
  } = useBridge();
  const selectedToken = useSelectedToken();
  const activeAccountAddress = useActiveAccountAddress();
  const { fee: bridgeFee } = useBridgeFee();
  const decimals = useDecimals();
  const transfer = useBridgeTransfer();

  const [txHash, setTxHash] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  const amountInDecimals = useMemo(() => {
    if (!amount) return null;
    return convertBnToDecimal(amount, decimals);
  }, [amount, decimals]);

  const destinationAmountInDecimals = useMemo(() => {
    if (!amountInDecimals) return null;
    return amountInDecimals.sub(bridgeFee ?? 0);
  }, [amountInDecimals, bridgeFee]);

  const bridgeTx = useCallback(async () => {
    notifyProcessing();

    try {
      // TODO: for EVM case, switch chain if the user's is on the wrong network

      setIsTransferring(true);
      const txId = await transfer();
      if (txId !== null) {
        setTxHash(txId);
      }
      setIsTransferring(false);
    } catch (error) {
      notifyError(ensureError(error));
    }

    // TODO: for EVM case, switch chain back to the original Tangle chain after the transaction is done
  }, [transfer, notifyProcessing, notifyError]);

  useEffect(() => {
    if (!txHash) return;
    const checkTxStatus = setInterval(() => {
      getStatus(
        txHash,
        selectedSourceChain.tag === 'live'
          ? Environment.MAINNET
          : selectedSourceChain.tag === 'test'
            ? Environment.TESTNET
            : Environment.DEVNET,
      )
        .then((data) => {
          if (data && data[0]) {
            const status = data[0].status;
            if (status === 'executed') {
              notifySuccess('0x0'); // TODO: the tx explorer link should be the one from Sygma Explorer
              clearInterval(checkTxStatus);
            }
            // Pending
            else if (status === 'pending') {
              //
            }

            // Failed
            else if (status === 'failed') {
              //
            }
            // TODO: handle other case
          } else {
            // TODO: handle tx get indexing
          }
        })
        .catch((error) => {
          notifyError(ensureError(error));
        });
    }, 5000);

    return () => clearInterval(checkTxStatus);
  }, [txHash, selectedSourceChain, notifySuccess, notifyError]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isOpen}
        className="w-full max-w-[calc(100vw-40px)] md:max-w-[500px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={handleClose}>
          Bridge Confirmation
        </ModalHeader>

        <div className="p-9 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <ConfirmationItem
              type="source"
              chainName={selectedSourceChain.name}
              accAddress={activeAccountAddress ?? ''}
              amount={amountInDecimals?.toString() ?? ''}
              tokenName={selectedToken.symbol}
            />

            <ArrowRight size="lg" className="rotate-90" />

            <ConfirmationItem
              type="destination"
              chainName={selectedDestinationChain.name}
              accAddress={destinationAddress}
              amount={destinationAmountInDecimals?.toString() ?? ''}
              tokenName={selectedToken.symbol}
            />
          </div>

          <FeeDetails />
        </div>

        <ModalFooter className="flex flex-col gap-1 px-8 py-6">
          <Button
            isFullWidth
            isLoading={isTransferring}
            onClick={() => {
              bridgeTx();
              handleClose(); // TODO: handle clear form
            }}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BridgeConfirmationModal;

const ConfirmationItem: FC<{
  type: 'source' | 'destination';
  chainName: string;
  accAddress: string;
  amount: string;
  tokenName: string;
}> = ({ type, chainName, accAddress, amount, tokenName }) => {
  return (
    <div className="bg-mono-20 dark:bg-mono-160 w-full space-y-2 p-4 rounded-xl">
      <div className="flex justify-between items-center">
        <Typography variant="body1">
          {type === 'source' ? 'From' : 'To'}
        </Typography>
        <div className="flex items-center gap-1.5">
          <ChainIcon name={chainName} />
          <Typography variant="body1">{chainName}</Typography>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Typography variant="body1">Account</Typography>
        <Typography
          variant="body1"
          className="max-w-[65%] break-words text-right"
        >
          {accAddress}
        </Typography>
      </div>
      <div className="flex justify-between items-center">
        <Typography variant="body1">Amount</Typography>
        <div className="flex items-center gap-1.5">
          <Typography variant="body1" fw="bold">
            {amount}
          </Typography>
          <TokenIcon name={tokenName} />
          <Typography variant="body1">{tokenName}</Typography>
        </div>
      </div>
    </div>
  );
};
