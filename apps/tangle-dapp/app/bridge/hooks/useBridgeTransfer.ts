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
import sygmaSubstrate from '../lib/transfer/sygmaSubstrate';
import useDecimals from './useDecimals';
import useEvmViemClient from './useEvmViemClient';
import useSelectedToken from './useSelectedToken';
import useSubstrateApi from './useSubstrateApi';

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
  const api = useSubstrateApi();

  // TODO: handle calculate real amount to bridge when user choose max amount
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
        return response;
      }
      case BridgeType.SYGMA_SUBSTRATE_TO_EVM:
      case BridgeType.SYGMA_SUBSTRATE_TO_SUBSTRATE: {
        if (api === null) {
          throw new Error('No Substrate API found');
        }

        const { tx } = await sygmaSubstrate(
          activeAccountAddress,
          destinationAddress,
          api,
          selectedSourceChain,
          selectedDestinationChain,
          selectedToken,
          amountToString,
        );

        const response = await tx.signAndSend(activeAccountAddress);
        return response;
      }

      default:
        return null;
    }
  };
}
