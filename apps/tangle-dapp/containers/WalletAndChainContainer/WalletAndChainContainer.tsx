'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  Button,
  ConnectWalletMobileButton,
  useCheckMobile,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { ChainSelector, WalletDropdown } from '../../components';

const WalletAndChainContainer: FC = () => {
  const { activeAccount, activeWallet, loading, isConnecting } =
    useWebContext();

  const { isMobile } = useCheckMobile();

  const { toggleModal } = useConnectWallet();

  return (
    <div className="flex items-center space-x-2">
      <ChainSelector />

      <div>
        {isConnecting || loading || !activeWallet || !activeAccount ? (
          isMobile ? (
            <ConnectWalletMobileButton appType="tangle-dapp" />
          ) : (
            <Button
              isLoading={loading}
              loadingText="Connecting..."
              onClick={() =>
                toggleModal(true, PresetTypedChainId.TangleTestnet ?? undefined)
              }
              className="flex justify-center items-center px-6"
            >
              Connect
            </Button>
          )
        ) : (
          <WalletDropdown account={activeAccount} wallet={activeWallet} />
        )}
      </div>
    </div>
  );
};

export default WalletAndChainContainer;
