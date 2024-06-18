'use client';

import { useBridge } from '../../../context/BridgeContext';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import useSubstrateInjectedExtension from '../../../hooks/useSubstrateInjectedExtension';
import { BridgeType } from '../../../types/bridge';
import sygmaEvm from '../lib/transfer/sygmaEvm';
import sygmaSubstrate from '../lib/transfer/sygmaSubstrate';
import useAmountToTransfer from './useAmountToTransfer';
import useEthersProvider from './useEthersProvider';
import useEthersSigner from './useEthersSigner';
import useSelectedToken from './useSelectedToken';
import useSubstrateApi from './useSubstrateApi';

export default function useBridgeTransfer(): () => Promise<string> {
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
  const amountToTransfer = useAmountToTransfer();

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
          amount: amountToTransfer,
        });

        if (!sygmaEvmTransfer) {
          throw new Error('Sygma EVM transfer failed');
        }

        const { tx } = sygmaEvmTransfer;
        const response = await ethersSigner.sendTransaction(tx);
        return response.hash;
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
          amount: amountToTransfer,
        });

        if (!sygmaSubstrateTransfer) {
          throw new Error('Sygma Substrate transfer failed');
        }

        const { tx } = sygmaSubstrateTransfer;

        return new Promise((resolve, reject) => {
          tx.signAndSend(
            activeAccountAddress,
            {
              signer: injector.signer,
              nonce: -1,
            },
            ({ status, dispatchError, events }) => {
              if (status.isInBlock || status.isFinalized) {
                for (const event of events) {
                  const {
                    event: { method },
                  } = event;

                  if (dispatchError && method === 'ExtrinsicFailed') {
                    let message: string = dispatchError.type;

                    if (dispatchError.isModule) {
                      try {
                        const mod = dispatchError.asModule;
                        const error = dispatchError.registry.findMetaError(mod);

                        message = `${error.section}.${error.name}`;
                      } catch (error) {
                        console.error(error);
                        reject(message);
                      }
                    } else if (dispatchError.isToken) {
                      message = `${dispatchError.type}.${dispatchError.asToken.type}`;
                    }
                    reject(message);
                  } else if (
                    method === 'ExtrinsicSuccess' &&
                    status.isFinalized
                  ) {
                    const blockHash = status.asFinalized;
                    api.rpc.chain.getBlock(blockHash).then((block) => {
                      const blockNumber = block.block.header.number.toNumber();
                      const extrinsics = block.block.extrinsics;
                      extrinsics.forEach(({ hash }, index) => {
                        if (hash.toHex() === tx.hash.toHex()) {
                          const txId = `${blockNumber}-${index}`;
                          resolve(txId);
                        }
                      });
                    });
                  }
                }
              } else if (status.isDropped) {
                reject('Transaction dropped');
              } else if (status.isRetracted) {
                reject('Transaction retracted');
              } else if (status.isInvalid) {
                reject('Transaction is invalid');
              } else if (status.isUsurped) {
                reject('Transaction is usurped');
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
