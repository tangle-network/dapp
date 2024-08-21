import { providers } from 'ethers';

import { useBridge } from '../../../context/BridgeContext';
import { useBridgeTxQueue } from '../../../context/BridgeTxQueueContext';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import useSubstrateInjectedExtension from '../../../hooks/useSubstrateInjectedExtension';
import { BridgeTxState, BridgeType } from '../../../types/bridge';
import sygmaEvm from '../lib/transfer/sygmaEvm';
import sygmaSubstrate from '../lib/transfer/sygmaSubstrate';
import useAmountInDecimals from './useAmountInDecimals';
import useEthersProvider from './useEthersProvider';
import useEthersSigner from './useEthersSigner';
import useFormattedAmountForSygmaTx from './useFormattedAmountForSygmaTx';
import useSelectedToken from './useSelectedToken';
import useSubstrateApi from './useSubstrateApi';
import useTypedChainId from './useTypedChainId';

export default function useBridgeTransfer({
  onTxAddedToQueue,
}: {
  onTxAddedToQueue: () => void;
}) {
  const activeAccountAddress = useActiveAccountAddress();
  const injector = useSubstrateInjectedExtension();
  const {
    destinationAddress,
    bridgeType,
    selectedSourceChain,
    selectedDestinationChain,
  } = useBridge();
  const selectedToken = useSelectedToken();
  const ethersProvider = useEthersProvider();
  const ethersSigner = useEthersSigner();
  const api = useSubstrateApi();
  const formattedAmount = useFormattedAmountForSygmaTx();
  const { sourceTypedChainId, destinationTypedChainId } = useTypedChainId();
  const { sourceAmountInDecimals, destinationAmountInDecimals } =
    useAmountInDecimals();

  const { addTxToQueue, addSygmaTxId, updateTxState } = useBridgeTxQueue();

  return async () => {
    if (activeAccountAddress === null) {
      throw new Error('No active account');
    }

    if (bridgeType === null) {
      throw new Error('There must be a bridge type');
    }

    if (
      sourceAmountInDecimals === null ||
      destinationAmountInDecimals === null
    ) {
      throw new Error('Amounts must be defined');
    }

    switch (bridgeType) {
      case BridgeType.SYGMA_EVM_TO_EVM:
      case BridgeType.SYGMA_EVM_TO_SUBSTRATE: {
        if (ethersProvider === null) {
          throw new Error('No Ethers Provider found');
        }
        if (ethersSigner === null) {
          throw new Error('No Ethers Signer found');
        }

        const sygmaEvmTransfer = await sygmaEvm({
          senderAddress: activeAccountAddress,
          recipientAddress: destinationAddress,
          provider: ethersProvider,
          sourceChain: selectedSourceChain,
          destinationChain: selectedDestinationChain,
          token: selectedToken,
          amount: formattedAmount,
        });

        if (!sygmaEvmTransfer) {
          throw new Error('Sygma EVM transfer failed');
        }

        const { tx, approvals } = sygmaEvmTransfer;

        for (const approval of approvals) {
          await ethersSigner.sendTransaction(
            approval as providers.TransactionRequest,
          );
        }

        const res = await ethersSigner.sendTransaction(tx);
        const txHash = res.hash;

        addTxToQueue({
          hash: txHash,
          env:
            selectedSourceChain.tag === 'live'
              ? 'live'
              : selectedSourceChain.tag === 'test'
                ? 'test'
                : 'dev',
          sourceTypedChainId,
          destinationTypedChainId,
          sourceAddress: activeAccountAddress,
          recipientAddress: destinationAddress,
          sourceAmount: sourceAmountInDecimals.toString(),
          destinationAmount: destinationAmountInDecimals.toString(),
          tokenSymbol: selectedToken.symbol,
          creationTimestamp: new Date().getTime(),
          state: BridgeTxState.Sending,
        });

        onTxAddedToQueue();

        const receipt = await res.wait();
        if (receipt.status === 1) {
          addSygmaTxId(txHash, receipt.transactionHash);
          updateTxState(txHash, BridgeTxState.Indexing);
        } else {
          updateTxState(txHash, BridgeTxState.Failed);
        }
        break;
      }

      case BridgeType.SYGMA_SUBSTRATE_TO_EVM:
      case BridgeType.SYGMA_SUBSTRATE_TO_SUBSTRATE: {
        if (api === null) {
          throw new Error('No Substrate API found');
        }

        if (injector === null) {
          throw new Error('No wallet injector found');
        }

        const sygmaSubstrateTransfer = await sygmaSubstrate({
          senderAddress: activeAccountAddress,
          recipientAddress: destinationAddress,
          api,
          sourceChain: selectedSourceChain,
          destinationChain: selectedDestinationChain,
          token: selectedToken,
          amount: formattedAmount,
        });

        if (!sygmaSubstrateTransfer) {
          throw new Error('Sygma Substrate transfer failed');
        }

        const { tx } = sygmaSubstrateTransfer;

        const unsub = await tx.signAndSend(
          activeAccountAddress,
          {
            signer: injector.signer,
            nonce: -1,
          },
          async ({
            status,
            dispatchError,
            txHash,
            txIndex,
            blockNumber,
            events,
          }) => {
            const txHashStr = txHash.toHex();

            // Add to the queue when the tx is ready
            if (status.isReady) {
              addTxToQueue({
                hash: txHashStr,
                env:
                  selectedSourceChain.tag === 'live'
                    ? 'live'
                    : selectedSourceChain.tag === 'test'
                      ? 'test'
                      : 'dev',
                sourceTypedChainId,
                destinationTypedChainId,
                sourceAddress: activeAccountAddress,
                recipientAddress: destinationAddress,
                sourceAmount: sourceAmountInDecimals.toString(),
                destinationAmount: destinationAmountInDecimals.toString(),
                tokenSymbol: selectedToken.symbol,
                creationTimestamp: new Date().getTime(),
                state: BridgeTxState.Sending,
              });

              onTxAddedToQueue();
            }

            if (dispatchError) {
              let message = `${dispatchError.type}`;
              if (dispatchError.isModule) {
                try {
                  const mod = dispatchError.asModule;
                  const error = dispatchError.registry.findMetaError(mod);
                  message = `${error.section}.${error.name}`;
                } catch (error) {
                  console.error(error);
                }
              } else if (dispatchError.isToken) {
                message = `${dispatchError.type}.${dispatchError.asToken.type}`;
              }
              updateTxState(txHashStr, BridgeTxState.Failed);
              throw new Error(message);
            }

            if (status.isFinalized) {
              addSygmaTxId(txHashStr, `${blockNumber}-${txIndex}`);

              // Check if the transaction is Extrinsic Success or Failed
              if (
                events[events.length - 1].event.method === 'ExtrinsicFailed'
              ) {
                updateTxState(txHashStr, BridgeTxState.Failed);
              } else {
                updateTxState(txHashStr, BridgeTxState.Indexing);
              }

              unsub();
            }
          },
        );
      }
    }
  };
}
