'use client';

import { Trigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from '@tangle-network/icons/ChevronDown';
import { LoginBoxLineIcon, WalletLineIcon } from '@tangle-network/icons';
import {
  Button,
  Dropdown,
  DropdownBody,
  ExternalLinkIcon,
  KeyValueWithButton,
  shortenHex,
  Typography,
} from '@tangle-network/ui-components';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { cloneElement, FC, ReactElement, useCallback, useMemo } from 'react';
import { useDisconnect } from 'wagmi';
import useNetworkStore from '../../context/useNetworkStore';
import { twMerge } from 'tailwind-merge';
import { getFlexBasic } from '@tangle-network/icons/utils';

type WalletDropdownProps = {
  accountAddress: EvmAddress;
  walletName: string;
  walletIcon: ReactElement;
  onAccountClick?: () => void;
};

const WalletDropdown: FC<WalletDropdownProps> = ({
  accountAddress,
  walletName,
  walletIcon,
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
        <button
          type="button"
          className={twMerge(
            'max-w-56 rounded-lg border-2 p-2 flex items-center gap-2',
            'bg-mono-0/10 dark:bg-mono-0/5',
            'hover:bg-mono-100/10 dark:hover:bg-mono-0/10',
            'border-2 border-mono-60 dark:border-mono-140',
          )}
        >
          {cloneElement(walletIcon, {
            ...walletIcon.props,
            className: twMerge(
              walletIcon.props.className,
              `shrink-0 grow-0 ${getFlexBasic('lg')}`,
            ),
          })}

          <Typography
            variant="body1"
            fw="bold"
            component="p"
            className="truncate dark:text-mono-0 sr-only sm:not-sr-only"
          >
            {shortenHex(accountAddress)}
          </Typography>

          <ChevronDown size="lg" className="shrink-0 grow-0" />
        </button>
      </DropdownTrigger>

      <DropdownBody
        isPortal
        className="mt-2 md:w-[540px] p-4 space-y-4 dark:bg-mono-180"
      >
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div className="flex space-x-2 items-center">
            {walletIcon}

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
