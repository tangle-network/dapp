'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { WebbWeb3Provider } from '@webb-tools/web3-api-provider';

import { useBridge } from '../../../context/BridgeContext';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import { BridgeType } from '../../../types/bridge';
import viemConnectorClientToEthersSigner from '../../../utils/viemConnectorClientToEthersSigner';
import sygmaEvm from '../lib/transfer/sygmaEvm';
import sygmaSubstrate from '../lib/transfer/sygmaSubstrate';
import useAmountToTransfer from './useAmountToTransfer';
import useEthersProvider from './useEthersProvider';
import useSelectedToken from './useSelectedToken';
import useSubstrateApi from './useSubstrateApi';

export default function useBridgeTransfer() {
  const { activeApi } = useWebContext();
  const activeAccountAddress = useActiveAccountAddress();
  const {
    destinationAddress,
    bridgeType,
    selectedSourceChain,
    selectedDestinationChain,
  } = useBridge();
  const selectedToken = useSelectedToken();
  const ethersProvider = useEthersProvider();
  const api = useSubstrateApi();
  const amountToTransfer = useAmountToTransfer();

  return async () => {
    if (activeAccountAddress === null) {
      throw new Error('No active account');
    }

    if (bridgeType === null) {
      throw new Error('There must be a bridge type');
    }

    // TODO: all can be transfer to Substrate because of precompile
    switch (bridgeType) {
      case BridgeType.SYGMA_EVM_TO_EVM:
      case BridgeType.SYGMA_EVM_TO_SUBSTRATE: {
        if (ethersProvider === null) {
          throw new Error('No Ethers Provider found');
        }
        if (!activeApi || !(activeApi instanceof WebbWeb3Provider)) {
          throw new Error('No active API found');
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

        const walletClient = activeApi.walletClient;
        const ethersSigner = viemConnectorClientToEthersSigner(walletClient);
        const response = await ethersSigner.sendTransaction(tx);
        return response;
      }
      case BridgeType.SYGMA_SUBSTRATE_TO_EVM:
      case BridgeType.SYGMA_SUBSTRATE_TO_SUBSTRATE: {
        if (api === null) {
          throw new Error('No Substrate API found');
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

        const response = await tx.signAndSend(activeAccountAddress);
        return response;
      }

      default:
        return null;
    }
  };
}
