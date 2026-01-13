import type {
  InjectedAccount,
  InjectedAccountWithMeta,
  InjectedExtension,
  Unsubcall,
} from '@polkadot/extension-inject/types';
import { ChevronDown, WalletLineIcon } from '@tangle-network/icons';
import {
  PolkadotJsIcon,
  SubWalletIcon,
  TalismanIcon,
} from '@tangle-network/icons/wallets';
import { Avatar } from '@tangle-network/ui-components/components/Avatar';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import { AnimatePresence, motion } from 'framer-motion';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import SubstrateWalletModal, {
  type SubstrateWalletName,
} from './SubstrateWalletModal';

const APP_NAME = 'Tangle dApp';
const STORAGE_KEY = 'tangle-migration-claim-substrate-wallet';

interface SavedConnection {
  walletName: SubstrateWalletName;
  accountAddress: string;
}

const WALLET_INFO: Record<
  SubstrateWalletName,
  { title: string; Icon: FC<{ className?: string }> }
> = {
  'polkadot-js': { title: 'Polkadot{.js}', Icon: PolkadotJsIcon },
  talisman: { title: 'Talisman', Icon: TalismanIcon },
  'subwallet-js': { title: 'SubWallet', Icon: SubWalletIcon },
};

/**
 * Ensures extension has accounts.subscribe method
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
          return () => {};
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

interface Props {
  selectedAccount: InjectedAccountWithMeta | null;
  onAccountSelect: (account: InjectedAccountWithMeta | null) => void;
  onExtensionChange?: (extension: InjectedExtension | null) => void;
  disabled?: boolean;
  className?: string;
}

const SubstrateWalletSelector: FC<Props> = ({
  selectedAccount,
  onAccountSelect,
  onExtensionChange,
  disabled = false,
  className,
}) => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [connectedWalletName, setConnectedWalletName] =
    useState<SubstrateWalletName | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const walletInfo = useMemo(() => {
    if (!connectedWalletName) return null;
    return WALLET_INFO[connectedWalletName];
  }, [connectedWalletName]);

  // Convert InjectedAccount to InjectedAccountWithMeta
  const convertAccounts = useCallback(
    (rawAccounts: InjectedAccount[], source: string): InjectedAccountWithMeta[] => {
      return rawAccounts.map((account) => ({
        address: account.address,
        meta: {
          name: account.name,
          source,
          genesisHash: account.genesisHash,
        },
        type: account.type,
      }));
    },
    [],
  );

  // localStorage helpers
  const saveConnection = useCallback(
    (walletName: SubstrateWalletName, accountAddress: string) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ walletName, accountAddress }),
      );
    },
    [],
  );

  const clearConnection = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const loadSavedConnection = useCallback((): SavedConnection | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  // Try to reconnect to saved wallet on mount
  useEffect(() => {
    const reconnect = async () => {
      const saved = loadSavedConnection();
      if (!saved) return;

      // Check if wallet is still installed
      if (!window.injectedWeb3?.[saved.walletName]) {
        clearConnection();
        return;
      }

      setIsReconnecting(true);

      try {
        const extension = await findSubstrateWallet(saved.walletName);
        const rawAccounts = await extension.accounts.get();

        if (rawAccounts.length === 0) {
          clearConnection();
          return;
        }

        const convertedAccounts = convertAccounts(rawAccounts, saved.walletName);
        setAccounts(convertedAccounts);
        setConnectedWalletName(saved.walletName);
        setIsConnected(true);
        onExtensionChange?.(extension);

        // Restore previously selected account
        const savedAccount = convertedAccounts.find(
          (acc) => acc.address === saved.accountAddress,
        );
        if (savedAccount) {
          onAccountSelect(savedAccount);
        }
      } catch (err) {
        console.error('Failed to reconnect wallet:', err);
        clearConnection();
      } finally {
        setIsReconnecting(false);
      }
    };

    reconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle wallet connection from modal
  const handleWalletConnect = useCallback(
    (
      walletName: SubstrateWalletName,
      rawAccounts: InjectedAccount[],
      extension: InjectedExtension,
    ) => {
      const convertedAccounts = convertAccounts(rawAccounts, walletName);
      setAccounts(convertedAccounts);
      setConnectedWalletName(walletName);
      setIsConnected(true);
      setError(null);
      onExtensionChange?.(extension);

      // Auto-select if only one account
      if (convertedAccounts.length === 1) {
        onAccountSelect(convertedAccounts[0]);
        saveConnection(walletName, convertedAccounts[0].address);
      }
    },
    [convertAccounts, onAccountSelect, onExtensionChange, saveConnection],
  );

  // Handle account selection
  const handleAccountClick = useCallback(
    (account: InjectedAccountWithMeta) => {
      onAccountSelect(account);
      setIsDropdownOpen(false);
      if (connectedWalletName) {
        saveConnection(connectedWalletName, account.address);
      }
    },
    [connectedWalletName, onAccountSelect, saveConnection],
  );

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setAccounts([]);
    setConnectedWalletName(null);
    onAccountSelect(null);
    onExtensionChange?.(null);
    setIsDropdownOpen(false);
    clearConnection();
  }, [clearConnection, onAccountSelect, onExtensionChange]);

  // Handle change wallet
  const handleChangeWallet = useCallback(() => {
    setIsDropdownOpen(false);
    setIsWalletModalOpen(true);
  }, []);

  // Not connected - show connect button
  if (!isConnected) {
    return (
      <div className={twMerge('space-y-2', className)}>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <Typography variant="body2" className="text-red-400 text-sm">
              {error}
            </Typography>
          </motion.div>
        )}

        <button
          onClick={() => setIsWalletModalOpen(true)}
          disabled={disabled || isReconnecting}
          className={twMerge(
            'w-full flex items-center gap-3 px-4 py-4 rounded-xl',
            'bg-gradient-to-r from-purple-500/10 to-blue-500/10',
            'border border-purple-500/30 hover:border-purple-500/50',
            'transition-all duration-200 group',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
            {isReconnecting ? (
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <WalletLineIcon className="w-5 h-5 text-purple-400" />
            )}
          </div>
          <div className="flex-1 text-left">
            <Typography
              variant="body1"
              fw="semibold"
              className="text-mono-200 dark:text-mono-0"
            >
              {isReconnecting ? 'Reconnecting...' : 'Connect Polkadot Wallet'}
            </Typography>
            <Typography variant="body2" className="text-mono-100 text-xs">
              Polkadot.js, Talisman, or SubWallet
            </Typography>
          </div>
        </button>

        <SubstrateWalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          onWalletConnect={handleWalletConnect}
        />
      </div>
    );
  }

  // Connected - show account selector
  const WalletIcon = walletInfo?.Icon;

  return (
    <div className={twMerge('relative', className)}>
      <button
        onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled}
        className={twMerge(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
          'bg-mono-200/5 dark:bg-mono-0/5 border border-mono-200/10 dark:border-mono-0/10',
          'hover:bg-mono-200/10 dark:hover:bg-mono-0/10 transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isDropdownOpen && 'ring-2 ring-purple-500/50',
        )}
      >
        {selectedAccount ? (
          <>
            <Avatar
              theme="substrate"
              value={selectedAccount.address}
              className="w-10 h-10"
            />
            <div className="flex-1 text-left min-w-0">
              <Typography
                variant="body2"
                fw="semibold"
                className="text-mono-200 dark:text-mono-0 truncate"
              >
                {selectedAccount.meta.name || 'Account'}
              </Typography>
              <div className="flex items-center gap-1.5">
                <Typography
                  variant="body2"
                  className="text-mono-100 text-xs font-mono"
                >
                  {shortenString(selectedAccount.address, 8)}
                </Typography>
                {walletInfo && (
                  <span className="text-mono-100 text-xs">
                    • {walletInfo.title}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-mono-100/20 flex items-center justify-center">
              {WalletIcon ? (
                <WalletIcon className="w-5 h-5" />
              ) : (
                <WalletLineIcon className="w-5 h-5 text-mono-100" />
              )}
            </div>
            <Typography
              variant="body2"
              className="text-mono-100 flex-1 text-left"
            >
              Select an account
            </Typography>
          </>
        )}
        <ChevronDown
          className={twMerge(
            'w-5 h-5 text-mono-100 transition-transform',
            isDropdownOpen && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 rounded-xl bg-mono-0 dark:bg-mono-180 border border-mono-40 dark:border-mono-160 shadow-xl overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto">
              {accounts.map((account) => (
                <button
                  key={account.address}
                  onClick={() => handleAccountClick(account)}
                  className={twMerge(
                    'w-full px-4 py-3 flex items-center gap-3',
                    'hover:bg-mono-20 dark:hover:bg-mono-170 transition-colors',
                    selectedAccount?.address === account.address &&
                      'bg-mono-20 dark:bg-mono-170',
                  )}
                >
                  <Avatar
                    theme="substrate"
                    value={account.address}
                    className="w-8 h-8"
                  />
                  <div className="flex-1 text-left min-w-0">
                    <Typography
                      variant="body2"
                      fw="medium"
                      className="text-mono-200 dark:text-mono-0 truncate"
                    >
                      {account.meta.name || 'Account'}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-mono-100 text-xs font-mono"
                    >
                      {shortenString(account.address, 10)}
                    </Typography>
                  </div>
                  {selectedAccount?.address === account.address && (
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-mono-40 dark:border-mono-160 p-2 space-y-1">
              <button
                onClick={handleChangeWallet}
                className="w-full px-3 py-2 text-sm text-mono-100 hover:bg-mono-20 dark:hover:bg-mono-170 rounded-lg transition-colors text-left"
              >
                Change Wallet
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
              >
                Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubstrateWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onWalletConnect={handleWalletConnect}
      />
    </div>
  );
};

export default SubstrateWalletSelector;
