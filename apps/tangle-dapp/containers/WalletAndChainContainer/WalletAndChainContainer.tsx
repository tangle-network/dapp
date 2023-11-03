'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Button,
  ConnectWalletMobileButton,
  useCheckMobile,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { WalletDropdown } from '../../components';
import useChainsFromRoute from '../../hooks/useChainsFromRoute';
import { useConnectWallet } from '../../hooks/useConnectWallet';

const WalletAndChainContainer: FC = () => {
  const { activeAccount, activeWallet, loading, isConnecting } =
    useWebContext();

  const { srcTypedChainId } = useChainsFromRoute();

  const { isMobile } = useCheckMobile();

  const { toggleModal } = useConnectWallet();

  return (
    <div className="flex items-center space-x-2">
      <div>Chain Selector</div>

      <div>
        {isConnecting || loading || !activeWallet || !activeAccount ? (
          isMobile ? (
            <ConnectWalletMobileButton />
          ) : (
            <Button
              isLoading={loading}
              loadingText="Connecting..."
              onClick={() => toggleModal(true, srcTypedChainId ?? undefined)}
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
