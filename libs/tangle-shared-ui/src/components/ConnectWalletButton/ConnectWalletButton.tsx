'use client';

import Spinner from '@tangle-network/icons/Spinner';
import { isEvmAddress } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { EvmWalletModal } from '../EvmWalletModal';
import WalletDropdown from './WalletDropdown';
import { getWalletIcon } from './walletIcons';

type ConnectWalletButtonProps = {
  className?: string;
};

const ConnectWalletButton = ({ className }: ConnectWalletButtonProps) => {
  const { address, isConnecting, isConnected, connector } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const accountAddress = useMemo<EvmAddress | null>(() => {
    if (!address) {
      return null;
    }
    if (isEvmAddress(address)) {
      return address;
    }
    return null;
  }, [address]);

  const walletName = connector?.name ?? 'Wallet';
  const walletIcon = getWalletIcon(connector?.id, connector?.name);
  const isReady = isConnected && accountAddress !== null;

  return (
    <>
      <div className={className}>
        {!isReady ? (
          <Button
            data-testid="evm-connect-trigger"
            isLoading={isConnecting}
            spinner={<Spinner size="lg" />}
            loadingText="Connecting"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center px-6"
          >
            Connect
          </Button>
        ) : (
          <WalletDropdown
            accountAddress={accountAddress}
            walletName={walletName}
            walletIcon={walletIcon}
            onAccountClick={() => setIsModalOpen(true)}
          />
        )}
      </div>

      <EvmWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ConnectWalletButton;
