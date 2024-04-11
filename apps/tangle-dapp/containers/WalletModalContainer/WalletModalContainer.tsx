'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import getPlatformMetaData from '@webb-tools/browser-utils/platform/getPlatformMetaData';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  calculateTypedChainId,
  ChainType,
} from '@webb-tools/sdk-core/typed-chain-id';
import { useWebbUI, WalletModal } from '@webb-tools/webb-ui-components';
import {
  Network,
  NetworkId,
} from '@webb-tools/webb-ui-components/constants/networks';
import { useMemo } from 'react';

import useNetworkStore from '../../context/useNetworkStore';

export const WalletModalContainer = () => {
  const {
    connectingWalletId,
    failedWalletId,
    isModalOpen,
    resetState,
    selectedWallet,
    connectWallet,
    toggleModal,
    connectError,
    supportedWallets,
  } = useConnectWallet({ useAllWallets: true });

  const { network } = useNetworkStore();

  const { notificationApi } = useWebbUI();

  const { apiConfig } = useWebContext();

  const targetTypedChainIds = useMemo(
    () => networkToTypedChainIds(network),
    [network]
  );

  return (
    <WalletModal
      connectingWalletId={connectingWalletId}
      platformId={getPlatformMetaData()?.id ?? null}
      failedWalletId={failedWalletId}
      isModalOpen={isModalOpen}
      resetState={resetState}
      selectedWallet={selectedWallet}
      connectWallet={connectWallet}
      toggleModal={toggleModal}
      connectError={connectError}
      supportedWallets={supportedWallets}
      notificationApi={notificationApi}
      apiConfig={apiConfig}
      targetTypedChainIds={targetTypedChainIds}
      contentDefaultText="Connect your EVM or Substrate wallet to interact on the Tangle Network"
    />
  );
};

const networkToTypedChainIds = (network: Network) => {
  switch (network.id) {
    case NetworkId.TANGLE_MAINNET:
      return {
        evm: PresetTypedChainId.TangleMainnetEVM,
        substrate: PresetTypedChainId.TangleMainnetNative,
      };

    case NetworkId.TANGLE_TESTNET:
    case NetworkId.TANGLE_LOCAL_DEV:
      return {
        evm: PresetTypedChainId.TangleTestnetEVM,
        substrate: PresetTypedChainId.TangleTestnetNative,
      };

    case NetworkId.CUSTOM: {
      if (typeof network.chainId !== 'number') {
        return;
      }

      return {
        evm: calculateTypedChainId(ChainType.EVM, network.chainId),
        substrate: calculateTypedChainId(ChainType.Substrate, network.chainId),
      };
    }

    default:
      return;
  }
};
