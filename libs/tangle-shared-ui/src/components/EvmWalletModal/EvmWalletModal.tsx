'use client';

import Spinner from '@tangle-network/icons/Spinner';
import {
  Modal,
  ModalContent,
  ModalHeader,
} from '@tangle-network/ui-components/components/Modal';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { type FC, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Connector, useAccount, useConnect, useDisconnect } from 'wagmi';
import { getWalletIcon } from '../ConnectWalletButton/walletIcons';

interface EvmWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EvmWalletModal: FC<EvmWalletModalProps> = ({ isOpen, onClose }) => {
  const { isConnected } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Filter and deduplicate connectors
  const availableConnectors = useMemo(() => {
    const seen = new Set<string>();
    return connectors.filter((connector) => {
      // Skip duplicates by name
      if (seen.has(connector.name)) return false;
      seen.add(connector.name);
      return true;
    });
  }, [connectors]);

  const handleConnect = useCallback(
    async (connector: Connector) => {
      setConnectingId(connector.id);
      try {
        connect(
          { connector },
          {
            onSuccess: () => {
              setConnectingId(null);
              onClose();
            },
            onError: () => {
              setConnectingId(null);
            },
          },
        );
      } catch {
        setConnectingId(null);
      }
    },
    [connect, onClose],
  );

  const handleDisconnect = useCallback(() => {
    disconnect();
    onClose();
  }, [disconnect, onClose]);

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent
        size="sm"
        title="Connect Wallet"
        description="Connect your EVM wallet"
        className="p-0"
      >
        <ModalHeader className="px-6 pt-6 pb-4 border-b border-mono-40 dark:border-mono-160">
          Connect Wallet
        </ModalHeader>

        <div className="p-4">
          {/* Available wallet connections */}
          <div className="space-y-2">
            {availableConnectors.map((connector) => {
              const isConnecting = connectingId === connector.id && isPending;
              const walletIcon = getWalletIcon(connector.id, connector.name);

              return (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={isPending}
                  className={twMerge(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                    'bg-mono-20 dark:bg-mono-170',
                    'hover:bg-mono-40 dark:hover:bg-mono-160',
                    'transition-colors duration-150',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-mono-0 dark:bg-mono-180 flex items-center justify-center overflow-hidden">
                    {walletIcon}
                  </div>

                  <Typography
                    variant="body1"
                    fw="semibold"
                    className="flex-1 text-left text-mono-200 dark:text-mono-0"
                  >
                    {connector.name}
                  </Typography>

                  {isConnecting && (
                    <Spinner size="md" className="text-mono-100" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <Typography variant="body2" className="text-red-500 text-center">
                {error.message.includes('rejected')
                  ? 'Connection rejected by user'
                  : 'Failed to connect. Please try again.'}
              </Typography>
            </div>
          )}

          {/* Disconnect Button (if connected) */}
          {isConnected && (
            <div className="mt-4 pt-4 border-t border-mono-40 dark:border-mono-160">
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

export default EvmWalletModal;
