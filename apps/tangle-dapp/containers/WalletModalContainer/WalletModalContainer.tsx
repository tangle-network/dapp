'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import getPlatformMetaData from '@webb-tools/browser-utils/platform/getPlatformMetaData';
import { WalletId } from '@webb-tools/dapp-types';
import {
  calculateTypedChainId,
  ChainType,
} from '@webb-tools/sdk-core/typed-chain-id';
import { useWebbUI, WalletModal } from '@webb-tools/webb-ui-components';
import { Network } from '@webb-tools/webb-ui-components/constants/networks';
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
    [network],
  );

  // TODO: Fix the issue with WalletConnectV2 and re-enable it.
  const wallets = useMemo(() => {
    // Exclude WalletConnectV2 from the list of supported wallets, as it
    // is currently broken in the dApp.
    return supportedWallets.filter(
      (wallet) => wallet.id !== WalletId.WalletConnectV2,
    );
  }, [supportedWallets]);

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
      supportedWallets={wallets}
      notificationApi={notificationApi}
      apiConfig={apiConfig}
      targetTypedChainIds={targetTypedChainIds}
      contentDefaultText="Connect your EVM or Substrate wallet to interact on the Tangle Network"
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
