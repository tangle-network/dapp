import { type InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { WalletLineIcon, ChevronDown } from '@tangle-network/icons';
import { Avatar } from '@tangle-network/ui-components/components/Avatar';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import { type FC, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  selectedAccount: InjectedAccountWithMeta | null;
  onAccountSelect: (account: InjectedAccountWithMeta | null) => void;
  disabled?: boolean;
  className?: string;
}

const SubstrateWalletSelector: FC<Props> = ({
  selectedAccount,
  onAccountSelect,
  disabled = false,
  className,
}) => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectExtension = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const { web3Enable, web3Accounts } = await import(
        '@polkadot/extension-dapp'
      );

      const extensions = await web3Enable('Tangle Migration Claim');

      if (extensions.length === 0) {
        throw new Error(
          'No Polkadot wallet found. Please install Polkadot.js, Talisman, or SubWallet.',
        );
      }

      const allAccounts = await web3Accounts();

      if (allAccounts.length === 0) {
        throw new Error(
          'No accounts found. Please create or import an account in your wallet.',
        );
      }

      setAccounts(allAccounts);
      setIsConnected(true);

      if (allAccounts.length === 1) {
        onAccountSelect(allAccounts[0]);
      }
    } catch (err) {
      console.error('Failed to connect extension:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [onAccountSelect]);

  const handleAccountClick = useCallback(
    (account: InjectedAccountWithMeta) => {
      onAccountSelect(account);
      setIsDropdownOpen(false);
    },
    [onAccountSelect],
  );

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setAccounts([]);
    onAccountSelect(null);
    setIsDropdownOpen(false);
  }, [onAccountSelect]);

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
          onClick={connectExtension}
          disabled={disabled || isConnecting}
          className={twMerge(
            'w-full flex items-center gap-3 px-4 py-4 rounded-xl',
            'bg-gradient-to-r from-purple-500/10 to-blue-500/10',
            'border border-purple-500/30 hover:border-purple-500/50',
            'transition-all duration-200 group',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
            {isConnecting ? (
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
              {isConnecting ? 'Connecting...' : 'Connect Polkadot Wallet'}
            </Typography>
            <Typography variant="body2" className="text-mono-100 text-xs">
              Polkadot.js, Talisman, or SubWallet
            </Typography>
          </div>
        </button>
      </div>
    );
  }

  // Connected - show account selector
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
              <Typography
                variant="body2"
                className="text-mono-100 text-xs font-mono"
              >
                {shortenString(selectedAccount.address, 8)}
              </Typography>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-mono-100/20 flex items-center justify-center">
              <WalletLineIcon className="w-5 h-5 text-mono-100" />
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

            <div className="border-t border-mono-40 dark:border-mono-160 p-2">
              <button
                onClick={handleDisconnect}
                className="w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubstrateWalletSelector;
