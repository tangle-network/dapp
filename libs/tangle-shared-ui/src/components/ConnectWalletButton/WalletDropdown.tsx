'use client';

import { ChevronDown } from '@tangle-network/icons/ChevronDown';
import { LoginBoxLineIcon, WalletLineIcon } from '@tangle-network/icons';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@tangle-network/sandbox-ui/primitives';
import { cloneElement, FC, ReactElement, useCallback, useMemo } from 'react';
import { useDisconnect } from 'wagmi';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';
import useNetworkStore from '../../context/useNetworkStore';
import { twMerge } from 'tailwind-merge';
import { getFlexBasic } from '@tangle-network/icons/utils';
import { getWalletIcon } from './walletIcons';

type WalletDropdownProps = {
  accountAddress: EvmAddress;
  walletName: string;
  connectorId?: string;
  connectorName?: string;
  onAccountClick?: () => void;
};

const WalletDropdown: FC<WalletDropdownProps> = ({
  accountAddress,
  walletName,
  connectorId,
  connectorName,
  onAccountClick,
}) => {
  const { disconnect } = useDisconnect();
  const walletIcon = useMemo<ReactElement>(() => {
    return getWalletIcon(connectorId, connectorName);
  }, [connectorId, connectorName]);

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={twMerge(
            'inline-flex h-11 max-w-64 items-center gap-2 rounded-lg border border-border bg-card px-3 text-foreground shadow-[var(--shadow-card)] transition-colors',
            'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          )}
        >
          {cloneElement(walletIcon, {
            ...walletIcon.props,
            className: twMerge(
              walletIcon.props.className,
              `shrink-0 grow-0 ${getFlexBasic('lg')}`,
            ),
          })}

          <span className="truncate font-bold text-sm sr-only sm:not-sr-only">
            {shortenAddress(accountAddress)}
          </span>

          <ChevronDown size="lg" className="shrink-0 grow-0 opacity-70" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="z-50 mt-2 w-[min(92vw,420px)] border-border bg-popover p-3 text-popover-foreground shadow-[var(--shadow-dropdown)]"
      >
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-3">
            {walletIcon}

            <div className="min-w-0">
              <p className="truncate font-display font-bold text-foreground text-sm capitalize">
                {walletName}
              </p>
              <p className="mt-1 truncate font-mono text-muted-foreground text-xs">
                {accountAddress}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-3 bg-border" />

        {onAccountClick && (
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={onAccountClick}
          >
            <WalletLineIcon className="fill-current" size="md" />
            Switch wallet
          </DropdownMenuItem>
        )}

        {accountExplorerUrl !== null && (
          <DropdownMenuItem className="cursor-pointer gap-2" asChild>
            <a href={accountExplorerUrl} target="_blank" rel="noreferrer">
              <WalletLineIcon className="fill-current" size="md" />
              View on explorer
            </a>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
          onClick={handleDisconnect}
        >
          <LoginBoxLineIcon className="fill-current" size="md" />
          Disconnect
        </DropdownMenuItem>

        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleDisconnect}
          >
            Disconnect wallet
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const shortenAddress = (address: EvmAddress) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export default WalletDropdown;
