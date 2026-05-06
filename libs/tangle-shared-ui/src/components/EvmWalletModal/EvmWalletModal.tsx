'use client';

import Spinner from '@tangle-network/icons/Spinner';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@tangle-network/sandbox-ui/primitives';
import { type FC, useCallback, useMemo, useState } from 'react';
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
  // Exclude Substrate-only wallets (they're only for the claim migration page)
  const availableConnectors = useMemo(() => {
    const seen = new Set<string>();
    const substrateWalletNames = ['subwallet', 'talisman', 'polkadot'];

    return connectors.filter((connector) => {
      // Skip duplicates by name
      if (seen.has(connector.name)) return false;
      seen.add(connector.name);

      // Skip Substrate wallets - they're only for claim migration page
      const lowerName = connector.name.toLowerCase();
      if (substrateWalletNames.some((name) => lowerName.includes(name))) {
        return false;
      }

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
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        variant="sandbox"
        className="tangle-wallet-modal w-[calc(100vw-2rem)] max-w-[440px] overflow-hidden border-border bg-card p-0 text-foreground shadow-[var(--shadow-dropdown)]"
      >
        <DialogHeader className="border-border border-b px-5 pb-4 pt-5 text-left">
          <DialogTitle className="font-display font-extrabold text-2xl text-foreground leading-none tracking-tight">
            Connect wallet
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-sm text-muted-foreground text-sm leading-5">
            Choose an EVM wallet for checkout, operator actions, and account
            state.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3">
          <div className="space-y-2.5">
            {availableConnectors.map((connector) => {
              const isConnecting = connectingId === connector.id && isPending;
              const walletIcon = getWalletIcon(connector.id, connector.name);

              return (
                <button
                  key={connector.id}
                  data-testid={`evm-wallet-option-${connector.id}`}
                  data-wallet-name={connector.name}
                  onClick={() => handleConnect(connector)}
                  disabled={isPending}
                  className="group flex min-h-16 w-full items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-left transition hover:border-primary hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card shadow-[var(--shadow-card)]">
                    {walletIcon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-display font-bold text-foreground text-base">
                      {connector.name}
                    </span>
                    <span className="mt-0.5 block text-muted-foreground text-xs">
                      Connect with {connector.name}
                    </span>
                  </div>

                  {isConnecting && (
                    <Spinner size="md" className="text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-[var(--surface-danger-border)] bg-[var(--surface-danger-bg)] p-3">
              <p className="text-center text-sm font-semibold text-[var(--surface-danger-text)]">
                {error.message.includes('rejected')
                  ? 'Connection rejected by user'
                  : 'Failed to connect. Please try again.'}
              </p>
            </div>
          )}

          {isConnected && (
            <div className="mt-4 border-border border-t pt-4">
              <Button
                variant="destructive"
                className="w-full rounded-md"
                onClick={handleDisconnect}
              >
                Disconnect wallet
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvmWalletModal;
