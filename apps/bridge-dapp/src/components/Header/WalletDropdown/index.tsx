import { Trigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { Account } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { ManagedWallet, WalletConfig } from '@webb-tools/dapp-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import {
  ExternalLinkLine,
  LoginBoxLineIcon,
  WalletLineIcon,
} from '@webb-tools/icons';
import { useWallets } from '@webb-tools/react-hooks';
import { WebbWeb3Provider, isViemError } from '@webb-tools/web3-api-provider';
import {
  Button,
  Dropdown,
  DropdownBody,
  KeyValueWithButton,
  Typography,
  WalletButton,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo } from 'react';
import NoteAccountAction from './NoteAccountAction';
import NoteAccountKey from './NoteAccountKey';

export const WalletDropdown: FC<{ account: Account; wallet: WalletConfig }> = ({
  account,
  wallet,
}) => {
  const { activeApi, activeChain, inactivateApi } = useWebContext();

  const { notificationApi } = useWebbUI();

  // Get all managed wallets
  const { wallets } = useWallets();

  const currentManagedWallet = useMemo<ManagedWallet | undefined>(() => {
    return wallets.find((w) => w.connected);
  }, [wallets]);

  // Calculate the account explorer url
  const accountExplorerUrl = useMemo(() => {
    if (!activeChain?.blockExplorers) return '#';

    const url = activeChain.blockExplorers.default.url;

    return new URL(`/address/${account.address}`, url).toString();
  }, [activeChain, account]);

  // Funciton to switch account within the connected wallet
  const handleSwitchAccount = useCallback(async () => {
    // Switch account only support on web3 provider
    if (!activeApi || !(activeApi instanceof WebbWeb3Provider)) {
      return;
    }

    try {
      const walletClient = activeApi.walletClient;

      await walletClient.requestPermissions({ eth_accounts: {} });
    } catch (error) {
      let message = WebbError.from(WebbErrorCodes.SwitchAccountFailed).message;

      if (isViemError(error)) {
        message = error.shortMessage;
      }

      notificationApi({ variant: 'error', message });
    }
  }, [activeApi, notificationApi]);

  // Disconnect function
  // TODO: The disconnect function does not work properly
  const handleDisconnect = useCallback(async () => {
    try {
      if (currentManagedWallet && currentManagedWallet.canEndSession) {
        currentManagedWallet.endSession();
      }

      await inactivateApi();
    } catch {
      const message = WebbError.getErrorMessage(
        WebbErrorCodes.FailedToDisconnect
      ).message;

      notificationApi({ variant: 'error', message });
    }
  }, [currentManagedWallet, inactivateApi, notificationApi]);

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <WalletButton wallet={wallet} address={account.address} />
      </DropdownTrigger>

      <DropdownBody className="mt-6 w-[480px] p-4 space-y-4 dark:bg-mono-160">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {wallet.Logo}

            <div>
              <Typography variant="h5" fw="bold" className="capitalize">
                {account.name || wallet.name}
              </Typography>

              <div className="flex items-center space-x-1">
                <KeyValueWithButton
                  className="mt-0.5"
                  isHiddenLabel
                  keyValue={account.address}
                  size="sm"
                  labelVariant="body1"
                  valueVariant="body1"
                />

                <a href={accountExplorerUrl} target="_blank" rel="noreferrer">
                  <ExternalLinkLine />
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2.5">
            <Button
              onClick={handleSwitchAccount}
              leftIcon={<WalletLineIcon className="!fill-current" size="lg" />}
              variant="link"
            >
              Switch
            </Button>

            <Button
              onClick={handleDisconnect}
              leftIcon={
                <LoginBoxLineIcon className="!fill-current" size="lg" />
              }
              variant="link"
            >
              Disconnect
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <NoteAccountKey />

          <div className="flex items-center gap-1 shrink-0">
            <NoteAccountAction />
          </div>
        </div>
      </DropdownBody>
    </Dropdown>
  );
};
