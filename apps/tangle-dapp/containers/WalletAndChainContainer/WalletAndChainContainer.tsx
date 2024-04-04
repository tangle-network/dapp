'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { ComputerIcon } from '@webb-tools/icons';
import {
  Button,
  ConnectWalletMobileButton,
  Typography,
  useCheckMobile,
} from '@webb-tools/webb-ui-components';
import dynamic from 'next/dynamic';
import { type FC } from 'react';

import { WalletDropdown } from '../../components';

const NetworkSelectionButton = dynamic(
  () => import('../../components/NetworkSelector/NetworkSelectionButton'),
  { ssr: false }
);

const WalletAndChainContainer: FC = () => {
  const { activeAccount, activeWallet, loading, isConnecting } =
    useWebContext();

  const { toggleModal } = useConnectWallet();
  const { isMobile } = useCheckMobile();

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
              isDisabled={loading}
              isLoading={loading}
              loadingText="Connecting..."
              onClick={() => toggleModal(true)}
              className="flex items-center justify-center px-6"
            >
              Connect
            </Button>
          )
        ) : (
          <WalletDropdown
            accountAddress={activeAccount.address}
            accountName={activeAccount.name}
            wallet={activeWallet}
          />
        )}
      </div>
    </div>
  );
};

export default WalletAndChainContainer;
