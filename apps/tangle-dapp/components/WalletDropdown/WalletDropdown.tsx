'use client';

import { encodeAddress } from '@polkadot/util-crypto';
import { Trigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { ManagedWallet, WalletConfig } from '@webb-tools/dapp-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import { LoginBoxLineIcon, WalletLineIcon } from '@webb-tools/icons';
import { useWallets } from '@webb-tools/react-hooks';
import { isViemError, WebbWeb3Provider } from '@webb-tools/web3-api-provider';
import {
  AccountDropdownBody,
  Button,
  Dropdown,
  DropdownBody,
  ExternalLinkIcon,
  KeyValueWithButton,
  shortenString,
  Typography,
  useWebbUI,
  WalletButton,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useSubstrateExplorerUrl from '../../hooks/useSubstrateExplorerUrl';

export const WalletDropdown: FC<{
  accountName?: string;
  accountAddress: string;
  wallet: WalletConfig;
}> = ({ accountAddress, accountName, wallet }) => {
  const { inactivateApi } = useWebContext();
  const { getExplorerUrl } = useSubstrateExplorerUrl();
  const { notificationApi } = useWebbUI();
  const { wallets } = useWallets();

  const currentManagedWallet = useMemo<ManagedWallet | undefined>(() => {
    return wallets.find((wallet) => wallet.connected);
  }, [wallets]);

  const accountExplorerUrl = getExplorerUrl(accountAddress, 'address');

  const handleDisconnect = useCallback(async () => {
    try {
      if (currentManagedWallet && currentManagedWallet.canEndSession) {
        currentManagedWallet.endSession();
      }

      await inactivateApi();
    } catch {
      const message = WebbError.getErrorMessage(
        WebbErrorCodes.FailedToDisconnect,
      ).message;

      notificationApi({ variant: 'error', message });
    }
  }, [currentManagedWallet, inactivateApi, notificationApi]);

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <WalletButton
          accountName={accountName}
          wallet={wallet}
          address={accountAddress}
          addressClassname="hidden lg:block"
        />
      </DropdownTrigger>

      <DropdownBody
        isPortal
        className="mt-2 md:w-[480px] p-4 space-y-4 dark:bg-mono-180"
      >
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div className="flex space-x-2">
            {wallet.Logo}

            <div>
              <Typography variant="h5" fw="bold" className="capitalize">
                {accountName ?? wallet.name}
              </Typography>

              <div className="flex items-center space-x-1">
                <KeyValueWithButton
                  className="mt-0.5"
                  isHiddenLabel
                  keyValue={accountAddress}
                  size="sm"
                  labelVariant="body1"
                  valueVariant="body1"
                  displayCharCount={5}
                />

                {accountExplorerUrl !== null && (
                  <ExternalLinkIcon href={accountExplorerUrl.toString()} />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center md:justify-end space-x-2.5">
            <SwitchAccountButton />

            <Button
              onClick={handleDisconnect}
              leftIcon={
                <LoginBoxLineIcon
                  className="fill-current dark:fill-current"
                  size="lg"
                />
              }
              variant="link"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </DropdownBody>
    </Dropdown>
  );
};

const SwitchAccountButton: FC = () => {
  const { network } = useNetworkStore();
  const { activeApi, accounts, setActiveAccount } = useWebContext();

  const { notificationApi } = useWebbUI();

  const handleSwitchAccount = useCallback(async () => {
    // Switch account only support on web3 provider.
    if (!activeApi) {
      return;
    }

    if (activeApi instanceof WebbWeb3Provider) {
      try {
        const walletClient = activeApi.walletClient;

        await walletClient.requestPermissions({ eth_accounts: {} });
      } catch (error) {
        let message = WebbError.from(
          WebbErrorCodes.SwitchAccountFailed,
        ).message;

        if (isViemError(error)) {
          message = error.shortMessage;
        }

        notificationApi({ variant: 'error', message });
      }
    }
  }, [activeApi, notificationApi]);

  if (!activeApi) {
    return null;
  }

  return activeApi instanceof WebbWeb3Provider ? (
    <Button
      onClick={handleSwitchAccount}
      leftIcon={<WalletLineIcon className="!fill-current" size="lg" />}
      variant="link"
    >
      Switch
    </Button>
  ) : (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button
          leftIcon={
            <WalletLineIcon
              className="fill-current dark:fill-current"
              size="lg"
            />
          }
          variant="link"
        >
          Switch
        </Button>
      </DropdownTrigger>

      <AccountDropdownBody
        addressShortenFn={shortenString}
        className="mt-2"
        accountItems={accounts.map((item) => {
          return {
            // Attempt to re-encode the address to match the active network's
            // SS58 prefix, if it's available.
            address: encodeAddress(item.address, network.ss58Prefix),
            name: item.name,
            onClick: () => setActiveAccount(item),
          };
        })}
      />
    </Dropdown>
  );
};
