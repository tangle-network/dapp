'use client';

import { useConnectWallet } from '@webb-tools/api-provider-environment';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { useMemo } from 'react';
import useNetworkStore from '../../context/useNetworkStore';
import UpdateMetadataButton from '../UpdateMetadataButton';
import WalletDropdown from './WalletDropdown';
import WalletModalContainer from './WalletModalContainer';
import {
  isSubstrateAddress,
  tryEncodeSubstrateAddress,
} from '@webb-tools/webb-ui-components';

const ConnectWalletButton = () => {
  const { activeAccount, activeWallet, loading, isConnecting } =
    useWebContext();

  const { network } = useNetworkStore();
  const { toggleModal } = useConnectWallet();

  const accountAddress = useMemo(() => {
    if (activeAccount?.address === undefined) {
      return null;
    } else if (!isSubstrateAddress(activeAccount.address)) {
      return activeAccount.address;
    }

    return tryEncodeSubstrateAddress(
      activeAccount?.address,
      network.ss58Prefix,
    );
  }, [activeAccount?.address, network.ss58Prefix]);

  const isReady =
    !isConnecting && !loading && activeWallet && activeAccount !== null;

  return (
    <>
      <div>
        {!isReady || !accountAddress ? (
          <Button
            isLoading={isConnecting || loading}
            loadingText={isConnecting ? 'Connecting' : undefined}
            onClick={() => toggleModal(true)}
            className="flex items-center justify-center px-6"
          >
            Connect
          </Button>
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
