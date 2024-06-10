'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { WebbWeb3Provider } from '@webb-tools/web3-api-provider';
import { useMemo } from 'react';
import { parseUnits } from 'viem';

import { useBridge } from '../../../context/BridgeContext';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import { BridgeType } from '../../../types/bridge';
import formatBnToDisplayAmount from '../../../utils/formatBnToDisplayAmount';
import viemConnectorClientToEthersSigner from '../../../utils/viemConnectorClientToEthersSigner';
import sygmaEvm from '../lib/transfer/sygmaEvm';
import useDecimals from './useDecimals';
import useEvmViemClient from './useEvmViemClient';
import useSelectedToken from './useSelectedToken';

export default function useBridgeTransfer() {
  const { activeApi } = useWebContext();
  const activeAccountAddress = useActiveAccountAddress();
  const {
    amount,
    destinationAddress,
    bridgeType,
    selectedSourceChain,
    selectedDestinationChain,
  } = useBridge();
  const selectedToken = useSelectedToken();
  const decimals = useDecimals();
  const viemClient = useEvmViemClient();

  const amountToString = useMemo(
    () =>
      amount !== null
        ? parseUnits(
            formatBnToDisplayAmount(amount, {
              includeCommas: false,
              fractionLength: undefined,
            }),
            decimals,
          ).toString()
        : '0',
    [amount, decimals],
  );

  return async ({ onReady }: { onReady?: () => void }) => {
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
        if (viemClient === null) {
          throw new Error('No Viem client found');
        }
        if (!activeApi || !(activeApi instanceof WebbWeb3Provider)) {
          throw new Error('No active API found');
        }

        const { tx } = await sygmaEvm(
          activeAccountAddress,
          destinationAddress,
          viemClient,
          selectedSourceChain,
          selectedDestinationChain,
          selectedToken,
          amountToString,
        );

        const walletClient = activeApi.walletClient;
        const ethersSigner = viemConnectorClientToEthersSigner(walletClient);
        const response = await ethersSigner.sendTransaction(tx);
        onReady?.();

        return response;
      }
      case BridgeType.SYGMA_SUBSTRATE_TO_EVM:
        break;
      case BridgeType.SYGMA_SUBSTRATE_TO_SUBSTRATE:
        break;
      default:
        throw new Error('Bridge type not supported');
    }
  };
}
