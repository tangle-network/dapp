'use client';

import { Button } from '@tangle-network/sandbox-ui/primitives';
import { lazy, Suspense, useMemo, useState } from 'react';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';

const EvmWalletModal = lazy(() => import('../EvmWalletModal/EvmWalletModal'));
const WalletDropdown = lazy(() => import('./WalletDropdown'));

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
    if (isAddress(address)) {
      return address as EvmAddress;
    }
    return null;
  }, [address]);

  const walletName = connector?.name ?? 'Wallet';
  const isReady = isConnected && accountAddress !== null;

  return (
    <>
      <div className={className}>
        {!isReady ? (
          <Button
            data-testid="evm-connect-trigger"
            loading={isConnecting}
            onClick={() => setIsModalOpen(true)}
            variant="sandbox"
            className="flex items-center justify-center px-6"
          >
            {isConnecting ? 'Connecting' : 'Connect'}
          </Button>
        ) : (
          <Suspense
            fallback={<ConnectedWalletFallback address={accountAddress} />}
          >
            <WalletDropdown
              accountAddress={accountAddress}
              walletName={walletName}
              connectorId={connector?.id}
              connectorName={connector?.name}
              onAccountClick={() => setIsModalOpen(true)}
            />
          </Suspense>
        )}
      </div>

      {isModalOpen && (
        <Suspense fallback={null}>
          <EvmWalletModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
};

const ConnectedWalletFallback = ({ address }: { address: EvmAddress }) => (
  <Button variant="outline" className="h-11 px-3 font-bold">
    {`${address.slice(0, 6)}...${address.slice(-4)}`}
  </Button>
);

export default ConnectWalletButton;
