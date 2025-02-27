import { useConnectWallet } from '@tangle-network/api-provider-environment';
import { useWebContext } from '@tangle-network/api-provider-environment/webb-context';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { useMemo } from 'react';
import useNetworkStore from '../../context/useNetworkStore';
import UpdateMetadataButton from '../UpdateMetadataButton';
import WalletDropdown from './WalletDropdown';
import ConnectWalletModal from './ConnectWalletModal';
import {
  assertSubstrateAddress,
  isEvmAddress,
  toSubstrateAddress,
} from '@tangle-network/ui-components';

const ConnectWalletButton = () => {
  const { activeAccount, activeWallet, loading, isConnecting } =
    useWebContext();

  const network = useNetworkStore((store) => store.network);
  const { toggleModal } = useConnectWallet();

  const accountAddress = useMemo(() => {
    if (activeAccount?.address === undefined) {
      return null;
    } else if (isEvmAddress(activeAccount.address)) {
      return activeAccount.address;
    } else if (network.ss58Prefix === undefined) {
      return assertSubstrateAddress(activeAccount.address);
    }

    return toSubstrateAddress(activeAccount.address, network.ss58Prefix);
  }, [activeAccount?.address, network.ss58Prefix]);

  const isReady =
    !isConnecting && !loading && activeWallet && activeAccount !== null;

  return (
    <>
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

      <ConnectWalletModal />
    </>
  );
};

export default ConnectWalletButton;
