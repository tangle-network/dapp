import { useConnectWallet } from '@tangle-network/api-provider-environment';
import { useWebContext } from '@tangle-network/api-provider-environment/webb-context';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { useMemo } from 'react';
import { isEvmAddress } from '@tangle-network/ui-components';
import ConnectWalletModal from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton/ConnectWalletModal';
import WalletDropdown from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton/WalletDropdown';
import useBridgeStore from '../../context/bridge/useBridgeStore';
import { calculateTypedChainId } from '@tangle-network/dapp-types';

const BridgeConnectWallet = () => {
  const { activeAccount, activeWallet, loading, isConnecting } =
    useWebContext();

  const { toggleModal: toggleConnectWalletModal } = useConnectWallet();

  const selectedSourceChain = useBridgeStore(
    (state) => state.selectedSourceChain,
  );

  const selectedSourceChainTypedChainId = useMemo(() => {
    return calculateTypedChainId(
      selectedSourceChain.chainType,
      selectedSourceChain.id,
    );
  }, [selectedSourceChain]);

  const accountAddress = useMemo(() => {
    if (!activeAccount || activeAccount?.address === undefined) {
      return null;
    } else if (isEvmAddress(activeAccount.address)) {
      return activeAccount.address;
    }
  }, [activeAccount]);

  const isReady =
    !isConnecting && !loading && activeWallet && activeAccount !== null;

  return (
    <>
      {!isReady || !accountAddress ? (
        <Button
          isLoading={isConnecting || loading}
          loadingText={isConnecting ? 'Connecting' : undefined}
          onClick={() =>
            toggleConnectWalletModal(true, selectedSourceChainTypedChainId)
          }
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
        </div>
      )}

      <ConnectWalletModal />
    </>
  );
};

export default BridgeConnectWallet;
