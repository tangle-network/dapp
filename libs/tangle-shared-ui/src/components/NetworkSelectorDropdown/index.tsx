'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { ChainConfig, chainsPopulated } from '@webb-tools/dapp-config';
import { Alert, ChainIcon, ChevronDown, Spinner } from '@webb-tools/icons';
import {
  calculateTypedChainId,
  ChainType,
} from '@webb-tools/dapp-types/TypedChainId';
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
import useSwitchNetwork from '../../hooks/useSwitchNetwork';
import createCustomNetwork from '../../utils/createCustomNetwork';
import { NetworkSelectorDropdown } from './NetworkSelectorDropdown';

const NetworkSelectionButton: FC<{
  isBridgePage?: boolean;
  bridgeSourceChain?: ChainConfig;
}> = ({ isBridgePage = false, bridgeSourceChain }) => {
  const { activeChain, activeWallet, isConnecting, loading, switchChain } =
    useWebContext();

  const { network } = useNetworkStore();
  const { switchNetwork, isCustom } = useSwitchNetwork();

  // TODO: Handle switching network on EVM wallet here.
  const switchToCustomNetwork = useCallback(
    (customRpcEndpoint: string) =>
      switchNetwork(createCustomNetwork(customRpcEndpoint), true),
    [switchNetwork],
  );

  const networkName = useMemo(
    () => {
      if (isConnecting) {
        return 'Connecting';
      } else if (loading) {
        return 'Loading';
      }

      return (
        network?.name ??
        activeChain?.displayName ??
        activeChain?.name ??
        'Unknown Network'
      );
    },
    // prettier-ignore
    [isConnecting, loading, activeChain?.displayName, activeChain?.name, network?.name],
  );

  const isWrongEvmNetwork = useMemo(() => {
    const isEvmWallet = activeWallet?.platform === 'EVM';

    if (!isEvmWallet) {
      return false;
    }

    if (isBridgePage) {
      return activeChain?.name !== bridgeSourceChain?.name;
    }

    return (
      network.evmChainId !== undefined && network.evmChainId !== activeChain?.id
    );
  }, [
    activeChain?.id,
    activeChain?.name,
    activeWallet?.platform,
    network.evmChainId,
    bridgeSourceChain?.name,
    isBridgePage,
  ]);

  const switchToCorrectEvmChain = useCallback(() => {
    if (!activeWallet) {
      return;
    }

    if (isBridgePage) {
      if (!bridgeSourceChain) {
        return;
      }
      const typedChainId = calculateTypedChainId(
        ChainType.EVM,
        bridgeSourceChain.id,
      );

      const targetChain = chainsPopulated[typedChainId];

      switchChain(targetChain, activeWallet);
    } else {
      if (!network.evmChainId) {
        return;
      }
      const typedChainId = calculateTypedChainId(
        ChainType.EVM,
        network.evmChainId,
      );
      const targetChain = chainsPopulated[typedChainId];
      switchChain(targetChain, activeWallet);
    }
  }, [
    activeWallet,
    network.evmChainId,
    switchChain,
    isBridgePage,
    bridgeSourceChain,
  ]);

  return (
    <div className="flex items-center gap-1">
      {isWrongEvmNetwork && (
        <Tooltip>
          <TooltipTrigger>
            <div
              className={twMerge(
                'cursor-pointer p-2 rounded-full',
                'bg-mono-0/10 dark:bg-mono-0/5',
                'hover:bg-mono-0/30 dark:hover:bg-mono-0/10',
                'border-mono-60 dark:border-mono-140',
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
        'flex items-center gap-2 rounded-lg p-2 px-4',
        'bg-transparent dark:bg-transparent',
        'hover:bg-mono-100/10 dark:hover:bg-mono-0/10',
        'border-2 border-mono-60 dark:border-mono-140',
        className,
      )}
    >
      {isLoading ? (
        <Spinner size="md" />
      ) : (
        <ChainIcon size="lg" className="shrink-0 grow-0" name={networkName} />
      )}

      <div className="flex items-center gap-1">
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
