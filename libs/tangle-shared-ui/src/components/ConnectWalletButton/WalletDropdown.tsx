'use client';

import { Trigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { LoginBoxLineIcon, WalletLineIcon } from '@tangle-network/icons';
import {
  Button,
  Dropdown,
  DropdownBody,
  ExternalLinkIcon,
  KeyValueWithButton,
  shortenString,
  Typography,
} from '@tangle-network/ui-components';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { FC, useCallback, useMemo } from 'react';
import { useDisconnect } from 'wagmi';
import useNetworkStore from '../../context/useNetworkStore';

type WalletDropdownProps = {
  accountAddress: EvmAddress;
  walletName: string;
  onAccountClick?: () => void;
};

const WalletDropdown: FC<WalletDropdownProps> = ({
  accountAddress,
  walletName,
  onAccountClick,
}) => {
  const { disconnect } = useDisconnect();

  const createExplorerAccountUrl = useNetworkStore(
    (store) => store.network.createExplorerAccountUrl,
  );

  const accountExplorerUrl = useMemo(() => {
    return createExplorerAccountUrl(accountAddress);
  }, [accountAddress, createExplorerAccountUrl]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-mono-160 hover:bg-mono-140 transition-colors">
          <Typography
            variant="body1"
            fw="semibold"
            className="truncate max-w-[120px]"
          >
            {shortenString(accountAddress, 4)}
          </Typography>
        </button>
      </DropdownTrigger>

      <DropdownBody
        isPortal
        className="mt-2 md:w-[540px] p-4 space-y-4 dark:bg-mono-180"
      >
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div className="flex space-x-2 items-center">
            <div>
              <Typography
                variant="h5"
                fw="bold"
                className="capitalize truncate max-w-[200px]"
              >
                {walletName}
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
            {onAccountClick && (
              <Button
                onClick={onAccountClick}
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
            )}

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

export default WalletDropdown;
