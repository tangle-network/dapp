'use client';

import { ProviderType } from '@hyperlane-xyz/sdk';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import { chainsConfig } from '@webb-tools/dapp-config';
import { providers } from 'ethers';

import { useBridge } from '../../../context/BridgeContext';
import { useBridgeTxQueue } from '../../../context/BridgeTxQueueContext';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import useSubstrateInjectedExtension from '../../../hooks/useSubstrateInjectedExtension';
import { hyperlaneTransfer } from '../../../lib/hyperlane/transfer';
import { BridgeTxState, BridgeType } from '../../../types/bridge';
import sygmaEvm from '../lib/transfer/sygmaEvm';
import sygmaSubstrate from '../lib/transfer/sygmaSubstrate';
import useAmountInDecimals from './useAmountInDecimals';
import useAmountInStr from './useAmountInStr';
import useEthersProvider from './useEthersProvider';
import useEthersSigner from './useEthersSigner';
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
  const amountInStr = useAmountInStr();
  const { sourceTypedChainId, destinationTypedChainId } = useTypedChainId();
  const { sourceAmountInDecimals, destinationAmountInDecimals } =
    useAmountInDecimals();

  const { addTxToQueue, addSygmaTxId, updateTxState, addTxExplorerUrl } =
    useBridgeTxQueue();

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
      case BridgeType.HYPERLANE_EVM_TO_EVM: {
        if (ethersProvider === null) {
          throw new Error('No Ethers Provider found');
        }
        if (ethersSigner === null) {
          throw new Error('No Ethers Signer found');
        }

        const hyperlaneResult = await hyperlaneTransfer({
          sourceTypedChainId,
          destinationTypedChainId,
          senderAddress: activeAccountAddress,
          recipientAddress: destinationAddress,
          token: selectedToken,
          amount: amountInStr,
        });

        if (!hyperlaneResult) throw new Error('Hyperlane transfer failed');
        const { txs } = hyperlaneResult;

        for (const tx of txs) {
          // Note, this doesn't use wagmi's prepare + send pattern because we're potentially sending two transactions
          // The prepare hooks are recommended to use pre-click downtime to run async calls, but since the flow
          // may require two serial txs, the prepare hooks aren't useful and complicate hook architecture considerably.
          // See https://github.com/hyperlane-xyz/hyperlane-warp-ui-template/issues/19
          // See https://github.com/wagmi-dev/wagmi/discussions/1564
          if (tx.type !== ProviderType.EthersV5) {
            throw new Error('Unsupported provider type');
          }
        }

        let txHash: string | undefined;

        for (const [idx, tx] of txs.entries()) {
          const res = await ethersSigner.sendTransaction(
            tx.transaction as providers.TransactionRequest,
          );

          // There are two transactions, one for approvals and one for actual transfer
          // We only want to add the actual transfer to the queue
          if (idx === txs.length - 1) {
            txHash = res.hash;
            // add Tx to Queue
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
              type: bridgeType,
            });

            updateTxState(txHash, BridgeTxState.Sending);
            if (chainsConfig[sourceTypedChainId].blockExplorers) {
              addTxExplorerUrl(
                txHash,
                getExplorerURI(
                  chainsConfig[sourceTypedChainId].blockExplorers.default.url,
                  txHash,
                  'tx',
                  'web3',
                ).toString(),
              );
            }
            onTxAddedToQueue();
          }

          const receipt = await res.wait();

          if (txHash !== undefined) {
            if (receipt.status === 1) {
              updateTxState(txHash, BridgeTxState.Executed);
            } else {
              updateTxState(txHash, BridgeTxState.Failed);
            }
          }
        }
        break;
      }

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
          amount: amountInStr,
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
          type: bridgeType,
        });

        updateTxState(txHash, BridgeTxState.Sending);
        onTxAddedToQueue();

        const receipt = await res.wait();
        if (receipt.status === 1) {
          addSygmaTxId(txHash, receipt.transactionHash);
          updateTxState(txHash, BridgeTxState.SygmaIndexing);
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
          amount: amountInStr,
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
                type: bridgeType,
              });

              updateTxState(txHashStr, BridgeTxState.Sending);
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
                updateTxState(txHashStr, BridgeTxState.SygmaIndexing);
              }

              unsub();
            }
          },
        );
      }
    }
  };
}
