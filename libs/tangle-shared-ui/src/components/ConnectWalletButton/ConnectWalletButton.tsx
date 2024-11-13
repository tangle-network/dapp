'use client';

import { useConnectWallet } from '@webb-tools/api-provider-environment';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ComputerIcon } from '@webb-tools/icons/ComputerIcon';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { ConnectWalletMobileButton } from '@webb-tools/webb-ui-components/components/ConnectWalletMobileButton';
import { useCheckMobile } from '@webb-tools/webb-ui-components/hooks/useCheckMobile';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import tryEncodeSubstrateAddress from '@webb-tools/webb-ui-components/utils/tryEncodeSubstrateAddress';
import { useMemo } from 'react';
import useNetworkStore from '../../context/useNetworkStore';
import UpdateMetadataButton from '../UpdateMetadataButton';
import WalletDropdown from './WalletDropdown';
import WalletModalContainer from './WalletModalContainer';

const ConnectWalletButton = () => {
  const { activeAccount, activeWallet, loading, isConnecting } =
    useWebContext();

  const { network } = useNetworkStore();
  const { toggleModal } = useConnectWallet();
  const { isMobile } = useCheckMobile();

  const accountAddress = useMemo(
    () => tryEncodeSubstrateAddress(activeAccount?.address, network.ss58Prefix),
    [activeAccount?.address, network.ss58Prefix],
  );

  const isReady =
    !isConnecting && !loading && activeWallet && activeAccount !== null;

  return (
    <>
      <div>
        {!isReady || !accountAddress ? (
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
              accountAddress={accountAddress}
              accountName={activeAccount.name}
              wallet={activeWallet}
            />

            <UpdateMetadataButton />
          </div>
        )}
      </div>

      <WalletModalContainer />
    </>
  );
};

export default ConnectWalletButton;
