'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import getPlatformMetaData from '@webb-tools/browser-utils/platform/getPlatformMetaData';
import {
  calculateTypedChainId,
  ChainType,
} from '@webb-tools/dapp-types/TypedChainId';
import { useWebbUI, WalletModal } from '@webb-tools/webb-ui-components';
import { Network } from '@webb-tools/webb-ui-components/constants/networks';
import { useMemo } from 'react';
import useNetworkStore from '../../context/useNetworkStore';

const WalletModalContainer = () => {
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
  } = useConnectWallet();

  const { network } = useNetworkStore();
  const { notificationApi } = useWebbUI();
  const { apiConfig } = useWebContext();

  const targetTypedChainIds = useMemo(
    () => networkToTypedChainIds(network),
    [network],
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
      contentDefaultText="Connect your Substrate or EVM wallet to interact with the Tangle Network."
    />
  );
};

const networkToTypedChainIds = (network: Network) => {
  const evm =
    typeof network.evmChainId !== 'undefined'
      ? calculateTypedChainId(ChainType.EVM, network.evmChainId)
      : undefined;

  const substrate =
    typeof network.substrateChainId !== 'undefined'
      ? calculateTypedChainId(ChainType.Substrate, network.substrateChainId)
      : undefined;

  return { evm, substrate };
};

export default WalletModalContainer;
