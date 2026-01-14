import type {
  InjectedAccount,
  InjectedExtension,
  Unsubcall,
} from '@polkadot/extension-inject/types';
import Spinner from '@tangle-network/icons/Spinner';
import {
  PolkadotJsIcon,
  SubWalletIcon,
  TalismanIcon,
} from '@tangle-network/icons/wallets';
import {
  Modal,
  ModalContent,
  ModalHeader,
} from '@tangle-network/ui-components/components/Modal';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { type FC, useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const APP_NAME = 'Tangle dApp';

/**
 * Ensures extension has accounts.subscribe method
 * Matches develop branch's ensureAccountsSubscribe
 */
function ensureAccountsSubscribe(
  extension: InjectedExtension,
): InjectedExtension {
  if (!extension.accounts.subscribe) {
    return {
      ...extension,
      accounts: {
        ...extension.accounts,
        subscribe: (
          cb: (accounts: InjectedAccount[]) => void | Promise<void>,
        ): Unsubcall => {
          extension.accounts.get().then(cb).catch(console.error);
          return Function.prototype as Unsubcall;
        },
      },
    };
  }
  return extension;
}

/**
 * Find and connect to a substrate wallet
 */
async function findSubstrateWallet(
  walletName: string,
): Promise<InjectedExtension> {
  const extension = window.injectedWeb3?.[walletName];

  if (extension === undefined) {
    throw new Error(`${walletName} is not installed`);
  }

  if (extension.connect !== undefined) {
    const ex = await extension.connect(APP_NAME);
    return ensureAccountsSubscribe(ex);
  }

  if (extension.enable !== undefined) {
    const injected = await extension.enable(APP_NAME);
    return ensureAccountsSubscribe({
      name: walletName,
      version: extension.version || 'unknown',
      ...injected,
    });
  }

  throw new Error(`${walletName} does not support connect() or enable()`);
}

const SUBSTRATE_WALLETS = [
  {
    id: 'polkadot-js',
    name: 'polkadot-js',
    title: 'Polkadot{.js}',
    Icon: PolkadotJsIcon,
  },
  {
    id: 'talisman',
    name: 'talisman',
    title: 'Talisman',
    Icon: TalismanIcon,
  },
  {
    id: 'subwallet-js',
    name: 'subwallet-js',
    title: 'SubWallet',
    Icon: SubWalletIcon,
  },
] as const;

export type SubstrateWalletName = (typeof SUBSTRATE_WALLETS)[number]['name'];

interface SubstrateWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnect: (
    walletName: SubstrateWalletName,
    accounts: InjectedAccount[],
    extension: InjectedExtension,
  ) => void;
}

const SubstrateWalletModal: FC<SubstrateWalletModalProps> = ({
  isOpen,
  onClose,
  onWalletConnect,
}) => {
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [installedWallets, setInstalledWallets] = useState<Set<string>>(
    new Set(),
  );

  // Detect installed wallets when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setError(null);

    const detected = new Set<string>();
    for (const wallet of SUBSTRATE_WALLETS) {
      const ext = window.injectedWeb3?.[wallet.name];
      if (ext && (ext.enable || ext.connect)) {
        detected.add(wallet.id);
      }
    }
    setInstalledWallets(detected);
  }, [isOpen]);

  const handleConnect = useCallback(
    async (wallet: (typeof SUBSTRATE_WALLETS)[number]) => {
      setConnectingWalletId(wallet.id);
      setError(null);

      try {
        const extension = await findSubstrateWallet(wallet.name);
        const accounts = await extension.accounts.get();

        if (accounts.length === 0) {
          throw new Error(
            `No accounts found. Please authorize accounts for this site in ${wallet.title} settings.`,
          );
        }

        onWalletConnect(wallet.name, accounts, extension);
        onClose();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to connect wallet';

        if (message.toLowerCase().includes('rejected')) {
          setError('Connection rejected. Please try again.');
        } else {
          setError(message);
        }
      } finally {
        setConnectingWalletId(null);
      }
    },
    [onWalletConnect, onClose],
  );

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent
        size="sm"
        title="Connect Substrate Wallet"
        description="Select a wallet to connect"
        className="p-0"
      >
        <ModalHeader className="px-6 pt-6 pb-4 border-b border-mono-40 dark:border-mono-160">
          Connect Substrate Wallet
        </ModalHeader>

        <div className="p-4">
          <div className="space-y-2">
            {SUBSTRATE_WALLETS.map((wallet) => {
              const isInstalled = installedWallets.has(wallet.id);
              const isConnecting = connectingWalletId === wallet.id;
              const Icon = wallet.Icon;

              return (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet)}
                  disabled={!isInstalled || connectingWalletId !== null}
                  className={twMerge(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                    'bg-mono-20 dark:bg-mono-170',
                    isInstalled && 'hover:bg-mono-40 dark:hover:bg-mono-160',
                    'transition-colors duration-150',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-mono-0 dark:bg-mono-180 flex items-center justify-center overflow-hidden">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 text-left">
                    <Typography
                      variant="body1"
                      fw="semibold"
                      className="text-mono-200 dark:text-mono-0"
                    >
                      {wallet.title}
                    </Typography>
                    {!isInstalled && (
                      <Typography
                        variant="body2"
                        className="text-mono-100 text-xs"
                      >
                        Not installed
                      </Typography>
                    )}
                  </div>

                  {isConnecting && (
                    <Spinner size="md" className="text-mono-100" />
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <Typography variant="body2" className="text-red-500 text-center">
                {error}
              </Typography>
            </div>
          )}

          {installedWallets.size === 0 && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Typography
                variant="body2"
                className="text-yellow-500 text-center"
              >
                No Substrate wallets detected. Please install Polkadot.js,
                Talisman, or SubWallet.
              </Typography>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

export default SubstrateWalletModal;
