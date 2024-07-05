'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { ComputerIcon } from '@webb-tools/icons';
import {
  calculateTypedChainId,
  ChainType,
} from '@webb-tools/sdk-core/typed-chain-id';
import {
  Button,
  ConnectWalletMobileButton,
  Typography,
  useCheckMobile,
} from '@webb-tools/webb-ui-components';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { FC, useEffect, useMemo } from 'react';

import { WalletDropdown } from '../../components';
import UpdateMetadataButton from '../../components/UpdateMetadataButton';
import useNetworkStore from '../../context/useNetworkStore';

const NetworkSelectionButton = dynamic(
  () => import('../../components/NetworkSelector/NetworkSelectionButton'),
  { ssr: false },
);

const WalletAndChainContainer: FC = () => {
  const pathname = usePathname();
  const {
    activeAccount,
    activeChain,
    activeWallet,
    loading,
    isConnecting,
    switchChain,
  } = useWebContext();
  const { network } = useNetworkStore();

  const { toggleModal } = useConnectWallet();
  const { isMobile } = useCheckMobile();

  const isBridgePage = useMemo(() => pathname === '/bridge', [pathname]);

  useEffect(() => {
    let isMounted = false;

    const checkAndSwitchEvmChainIfNeeded = () => {
      if (isBridgePage) return;
      const isEvmWallet = activeWallet?.platform === 'EVM';
      if (isEvmWallet && network?.evmChainId) {
        if (activeChain?.id !== network.evmChainId) {
          const typedChainId = calculateTypedChainId(
            ChainType.EVM,
            network.evmChainId,
          );
          const targetChain = chainsPopulated[typedChainId];
          switchChain(targetChain, activeWallet);
        }
      }
    };

    isMounted = true;
    if (isMounted) {
      checkAndSwitchEvmChainIfNeeded();
    }

    return () => {
      isMounted = false;
    };
  }, [
    isBridgePage,
    activeWallet,
    network?.evmChainId,
    activeChain?.id,
    switchChain,
  ]);

  return (
    <div className="flex items-center gap-2">
      <NetworkSelectionButton />

      <div>
        {isConnecting || loading || !activeWallet || !activeAccount ? (
          isMobile ? (
            <ConnectWalletMobileButton>
              <div className="flex flex-col items-center justify-center gap-4 py-9">
                <ComputerIcon size="xl" className="mx-auto" />

                <Typography variant="body1" className="text-center">
                  For the best staking experience, we recommend using our
                  desktop interface for full-feature interface and enhanced
                  controls.
                </Typography>
              </div>
            </ConnectWalletMobileButton>
          ) : (
            <Button
              isLoading={isConnecting || loading}
              loadingText={isConnecting ? 'Connecting...' : 'Loading...'}
              onClick={() => toggleModal(true)}
              className="flex items-center justify-center px-6"
            >
              Connect
            </Button>
          )
        ) : (
          <div className="relative">
            <WalletDropdown
              accountAddress={activeAccount.address}
              accountName={activeAccount.name}
              wallet={activeWallet}
            />

            <UpdateMetadataButton />
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletAndChainContainer;
