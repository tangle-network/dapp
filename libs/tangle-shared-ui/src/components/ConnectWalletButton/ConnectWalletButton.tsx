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
import { calculateTypedChainId } from '@tangle-network/dapp-types';
import { ChainConfig } from '@tangle-network/dapp-config';

type ConnectWalletButtonProps = {
  showChainSpecificWallets?: boolean;
  preferredChain?: ChainConfig;
};

const ConnectWalletButton = ({
  showChainSpecificWallets = false,
  preferredChain,
}: ConnectWalletButtonProps) => {
  const { activeAccount, activeWallet, loading, isConnecting } =
    useWebContext();

  const network = useNetworkStore((store) => store.network);
  const { toggleModal } = useConnectWallet();

  const preferredChainTypedChainId = useMemo(() => {
    if (showChainSpecificWallets && preferredChain) {
      return calculateTypedChainId(preferredChain.chainType, preferredChain.id);
    }
    return undefined;
  }, [showChainSpecificWallets, preferredChain]);

  const accountAddress = useMemo(() => {
    if (activeAccount?.address === undefined) {
      return null;
    } else if (isEvmAddress(activeAccount.address)) {
      return activeAccount.address;
    } else if (!showChainSpecificWallets && network.ss58Prefix === undefined) {
      return assertSubstrateAddress(activeAccount.address);
    } else if (!showChainSpecificWallets) {
      return toSubstrateAddress(activeAccount.address, network.ss58Prefix);
    }

    return null;
  }, [activeAccount?.address, network.ss58Prefix, showChainSpecificWallets]);

  const isReady =
    !isConnecting && !loading && activeWallet && activeAccount !== null;

  return (
    <>
      {!isReady || !accountAddress ? (
        <Button
          isLoading={isConnecting || loading}
          loadingText={isConnecting ? 'Connecting' : undefined}
          onClick={() => toggleModal(true, preferredChainTypedChainId)}
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

          {!showChainSpecificWallets && <UpdateMetadataButton />}
        </div>
      )}

      <ConnectWalletModal />
    </>
  );
};

export default ConnectWalletButton;
