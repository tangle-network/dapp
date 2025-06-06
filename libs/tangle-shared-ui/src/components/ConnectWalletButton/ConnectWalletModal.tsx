'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@tangle-network/api-provider-environment';
import getPlatformMetaData from '@tangle-network/browser-utils/platform/getPlatformMetaData';
import {
  calculateTypedChainId,
  ChainType,
} from '@tangle-network/dapp-types/TypedChainId';
import { useUIContext, WalletModal } from '@tangle-network/ui-components';
import { Network } from '@tangle-network/ui-components/constants/networks';
import { useMemo } from 'react';
import useNetworkStore from '../../context/useNetworkStore';

const ConnectWalletModal = ({
  walletModalDefaultText = 'Connect your Substrate or EVM wallet to interact with the Tangle Network.',
}) => {
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

  // TODO: Remove this - temporarily removing Phantom wallet support
  const filteredSupportedWallets = useMemo(() => {
    return supportedWallets.filter((wallet) => wallet.name !== 'Phantom');
  }, [supportedWallets]);

  const { network } = useNetworkStore();
  const { notificationApi } = useUIContext();
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
      supportedWallets={filteredSupportedWallets}
      notificationApi={notificationApi}
      apiConfig={apiConfig}
      targetTypedChainIds={targetTypedChainIds}
      contentDefaultText={walletModalDefaultText}
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

export default ConnectWalletModal;
