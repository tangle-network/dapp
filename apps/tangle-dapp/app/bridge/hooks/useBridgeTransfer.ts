'use client';

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

export default function useBridgeTransfer(): () => Promise<{
  txHash: string;
  sygmaTxId: string;
}> {
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

  const { addTxToQueue, updateTxHash } = useBridgeTxQueue();

  return async () => {
    if (activeAccountAddress === null) {
      throw new Error('No active account');
    }

    if (bridgeType === null) {
      throw new Error('There must be a bridge type');
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

        const { tx } = sygmaEvmTransfer;
        const response = await ethersSigner.sendTransaction(tx);
        return {
          txHash: response.hash,
          sygmaTxId: response.hash,
        };
      }

      case BridgeType.SYGMA_SUBSTRATE_TO_EVM:
      case BridgeType.SYGMA_SUBSTRATE_TO_SUBSTRATE: {
        if (api === null) {
          throw new Error('No Substrate API found');
        }

        if (injector === null) {
          throw new Error('No wallet injector found');
        }

        if (
          sourceAmountInDecimals === null ||
          destinationAmountInDecimals === null
        ) {
          throw new Error('Amounts must be defined');
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

        // Add the transaction to the queue
        const initialTxHash = tx.hash.toHex();
        addTxToQueue({
          hash: initialTxHash,
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
          state: BridgeTxState.SigningAndSending,
        });

        // Returning a new promise to handle sign and send
        return new Promise((resolve, reject) => {
          tx.signAndSend(
            activeAccountAddress,
            {
              signer: injector.signer,
              nonce: -1,
            },
            async ({ status, dispatchError }) => {
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
                return reject(message);
              }

              if (status.isFinalized) {
                const blockHash = status.asFinalized;
                try {
                  const block = await api.rpc.chain.getBlock(blockHash);
                  const blockNumber = block.block.header.number.toNumber();
                  const extrinsics = block.block.extrinsics;

                  for (const [index, { hash }] of extrinsics.entries()) {
                    const finalizedTxHash = tx.hash.toHex();
                    if (hash.toHex() === finalizedTxHash) {
                      const txId = `${blockNumber}-${index}`;
                      // somehow the tx hash for Substrate ts ix different when the tx is created and when it is finalized
                      updateTxHash(initialTxHash, finalizedTxHash);
                      return resolve({
                        txHash: finalizedTxHash,
                        sygmaTxId: txId,
                      });
                    }
                  }

                  return reject("Can't find the transaction");
                } catch {
                  return reject('Cannot get the block');
                }
              } else if (status.isDropped) {
                return reject('Transaction dropped');
              } else if (status.isRetracted) {
                return reject('Transaction retracted');
              } else if (status.isInvalid) {
                return reject('Transaction is invalid');
              } else if (status.isUsurped) {
                return reject('Transaction is usurped');
              }
            },
          );
        });
      }

      default:
        throw new Error('Unsupported bridge type');
    }
  };
}
