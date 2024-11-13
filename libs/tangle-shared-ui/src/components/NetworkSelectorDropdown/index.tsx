'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { Alert, ChainIcon, ChevronDown, Spinner } from '@webb-tools/icons';
import {
  calculateTypedChainId,
  ChainType,
} from '@webb-tools/sdk-core/typed-chain-id';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC, useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import useNetworkStore from '../../context/useNetworkStore';
import useNetworkSwitcher from '../../hooks/useNetworkSwitcher';
import createCustomNetwork from '../../utils/createCustomNetwork';
import { NetworkSelectorDropdown } from './NetworkSelectorDropdown';

export type NetworkSelectionButtonProps = {
  isNetworkSwitchDisabled?: boolean;
};

const NetworkSelectionButton: FC<NetworkSelectionButtonProps> = ({
  isNetworkSwitchDisabled = false,
}) => {
  const { activeChain, activeWallet, isConnecting, loading, switchChain } =
    useWebContext();

  const { network } = useNetworkStore();
  const { switchNetwork, isCustom } = useNetworkSwitcher();

  // TODO: Handle switching network on EVM wallet here.
  const switchToCustomNetwork = useCallback(
    (customRpcEndpoint: string) =>
      switchNetwork(createCustomNetwork(customRpcEndpoint), true),
    [switchNetwork],
  );

  const networkName = useMemo(() => {
    if (isConnecting) {
      return 'Connecting...';
    } else if (loading) {
      return 'Loading...';
    }

    return network?.name ?? 'Unknown Network';
  }, [isConnecting, loading, network?.name]);

  const isWrongEvmNetwork = useMemo(() => {
    const isEvmWallet = activeWallet?.platform === 'EVM';

    return (
      isEvmWallet &&
      network.evmChainId !== undefined &&
      network.evmChainId !== activeChain?.id
    );
  }, [activeChain?.id, activeWallet?.platform, network.evmChainId]);

  const switchToCorrectEvmChain = useCallback(() => {
    if (!network.evmChainId || !activeWallet) {
      return;
    }

    const typedChainId = calculateTypedChainId(
      ChainType.EVM,
      network.evmChainId,
    );

    const targetChain = chainsPopulated[typedChainId];

    switchChain(targetChain, activeWallet);
  }, [activeWallet, network.evmChainId, switchChain]);

  if (isNetworkSwitchDisabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Dropdown>
            <TriggerButton
              className="opacity-60 cursor-not-allowed hover:!bg-none dark:hover:!bg-none"
              networkName={networkName}
              isLocked
            />
          </Dropdown>
        </TooltipTrigger>

        <TooltipBody side="bottom">
          Network can&apos;t be changed while you&apos;re in this page.
        </TooltipBody>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {isWrongEvmNetwork && (
        <Tooltip>
          <TooltipTrigger>
            <div
              className={twMerge(
                'cursor-pointer p-2 rounded-full',
                'bg-mono-0/10 border-mono-60',
                'dark:bg-mono-0/5 dark:border-mono-140',
                'hover:bg-mono-0/30',
                'dark:hover:bg-mono-0/10',
              )}
              onClick={switchToCorrectEvmChain}
            >
              <Alert className="fill-red-70 dark:fill-red-50" />
            </div>
          </TooltipTrigger>

          <TooltipBody>Wrong EVM Chain Connected</TooltipBody>
        </Tooltip>
      )}

      <Dropdown>
        <TriggerButton
          isLoading={isConnecting || loading}
          networkName={networkName}
          className="overflow-hidden"
        />

        <DropdownBody isPortal className="mt-2">
          <NetworkSelectorDropdown
            isCustomEndpointSelected={isCustom}
            selectedNetwork={network}
            onSetCustomNetwork={switchToCustomNetwork}
            onNetworkChange={(newNetwork) => switchNetwork(newNetwork, false)}
          />
        </DropdownBody>
      </Dropdown>
    </div>
  );
};

type TriggerButtonProps = {
  className?: string;
  networkName: string;
  isLoading?: boolean;
  isLocked?: boolean;
};

const TriggerButton: FC<TriggerButtonProps> = ({
  isLoading = false,
  networkName,
  className,
  isLocked = false,
}) => {
  return (
    <DropdownBasicButton
      type="button"
      disabled={isLoading}
      className={twMerge(
        'rounded-lg border-2 p-2',
        'bg-mono-0/10 border-mono-60',
        'hover:bg-mono-0/30',
        'dark:bg-mono-0/5 dark:border-mono-140',
        'dark:hover:bg-mono-0/10',
        'flex items-center gap-2',
        className,
      )}
    >
      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <ChainIcon size="lg" className="shrink-0 grow-0" name={networkName} />
      )}

      <div className="flex items-center gap-0">
        <Typography
          variant="body1"
          fw="bold"
          className="hidden dark:text-mono-0 sm:block"
        >
          {networkName}
        </Typography>

        {!isLocked && <ChevronDown size="lg" className="shrink-0 grow-0" />}
      </div>
    </DropdownBasicButton>
  );
};

export default NetworkSelectionButton;
