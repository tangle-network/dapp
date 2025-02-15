'use client';

import { encodeAddress } from '@polkadot/util-crypto';
import { Trigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { useWebContext } from '@tangle-network/api-provider-environment';
import { useWallets } from '@tangle-network/api-provider-environment/hooks/useWallets';
import { ManagedWallet, WalletConfig } from '@tangle-network/dapp-config';
import { WebbError, WebbErrorCodes } from '@tangle-network/dapp-types';
import { LoginBoxLineIcon, WalletLineIcon } from '@tangle-network/icons';
import { WebbWeb3Provider } from '@tangle-network/web3-api-provider';
import {
  AccountDropdownBody,
  Button,
  Dropdown,
  DropdownBody,
  ExternalLinkIcon,
  isSubstrateAddress,
  KeyValueWithButton,
  shortenString,
  Typography,
  useUIContext,
  WalletButton,
} from '@tangle-network/ui-components';
import { FC, useCallback, useMemo } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import { BaseError } from 'viem';
import {
  EvmAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';

const WalletDropdown: FC<{
  accountName?: string;
  accountAddress: SubstrateAddress | EvmAddress;
  wallet: WalletConfig;
}> = ({ accountAddress, accountName, wallet }) => {
  const { inactivateApi } = useWebContext();
  const { notificationApi } = useUIContext();
  const { wallets } = useWallets();

  const createExplorerAccountUrl = useNetworkStore(
    (store) => store.network.createExplorerAccountUrl,
  );

  const currentManagedWallet = useMemo<ManagedWallet | undefined>(() => {
    return wallets.find((wallet) => wallet.connected);
  }, [wallets]);

  const accountExplorerUrl = useMemo(() => {
    return createExplorerAccountUrl(accountAddress);
  }, [accountAddress, createExplorerAccountUrl]);

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
        />
      </DropdownTrigger>

      <DropdownBody
        isPortal
        className="mt-2 md:w-[540px] p-4 space-y-4 dark:bg-mono-180"
      >
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div className="flex space-x-2 items-center">
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
                  valueVariant="h5"
                  displayCharCount={5}
                />

                {accountExplorerUrl !== null && (
                  <ExternalLinkIcon href={accountExplorerUrl} size="md" />
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
                  size="md"
                />
              }
              variant="link"
              className="text-lg"
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

  const { notificationApi } = useUIContext();

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

        if (error instanceof BaseError) {
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
      leftIcon={
        <WalletLineIcon className="fill-current dark:fill-current" size="md" />
      }
      variant="link"
      className="text-lg"
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
              size="md"
            />
          }
          variant="link"
          className="text-lg"
        >
          Switch
        </Button>
      </DropdownTrigger>

      <AccountDropdownBody
        addressShortenFn={shortenString}
        className="mt-2"
        accountItems={accounts.map((account) => {
          // Attempt to re-encode the address to match the active network's
          // SS58 prefix, if it's available. Leave it as is if it's an EVM
          // account address.
          const address = isSubstrateAddress(account.address)
            ? encodeAddress(account.address, network.ss58Prefix)
            : account.address;

          return {
            address,
            name: account.name,
            onClick: () => setActiveAccount(account),
          };
        })}
      />
    </Dropdown>
  );
};

export default WalletDropdown;
