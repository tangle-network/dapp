'use client';

import { useWebContext } from '@tangle-network/api-provider-environment';
import { ChainConfig, chainsPopulated } from '@tangle-network/dapp-config';
import { Alert, ChainIcon, ChevronDown, Spinner } from '@tangle-network/icons';
import {
  calculateTypedChainId,
  ChainType,
} from '@tangle-network/dapp-types/TypedChainId';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@tangle-network/ui-components';
import { type FC, useCallback, useMemo } from 'react';
import cx from 'classnames';
import useNetworkStore from '../../context/useNetworkStore';
import useSwitchNetwork from '../../hooks/useSwitchNetwork';
import createCustomNetwork from '../../utils/createCustomNetwork';
import { NetworkSelectorDropdown } from './NetworkSelectorDropdown';

type NetworkSelectionButtonProps = {
  disableChainSelection?: boolean;
  preferredChain?: ChainConfig;
  overrideIsWrongEvmNetworkWithPreferredChain?: boolean;
};

const NetworkSelectionButton: FC<NetworkSelectionButtonProps> = ({
  disableChainSelection = false,
  preferredChain,
  overrideIsWrongEvmNetworkWithPreferredChain = false,
}) => {
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

      if (disableChainSelection) {
        return activeChain?.name === 'Tangle Mainnet'
          ? activeChain.name
          : (activeChain?.displayName ??
              activeChain?.name ??
              'Unknown Network');
      }

      return (
        network?.name ??
        activeChain?.displayName ??
        activeChain?.name ??
        'Unknown Network'
      );
    },
    // prettier-ignore
    [isConnecting, loading, disableChainSelection, network?.name, activeChain?.displayName, activeChain?.name],
  );

  const isWrongEvmNetwork = useMemo(() => {
    const isEvmWallet = activeWallet?.platform === 'EVM';

    if (!isEvmWallet) {
      return false;
    }

    if (overrideIsWrongEvmNetworkWithPreferredChain && preferredChain) {
      return activeChain?.name !== preferredChain?.name;
    }

    return (
      network.evmChainId !== undefined && network.evmChainId !== activeChain?.id
    );
  }, [
    activeChain?.id,
    activeChain?.name,
    activeWallet?.platform,
    network.evmChainId,
    overrideIsWrongEvmNetworkWithPreferredChain,
    preferredChain,
  ]);

  const switchToCorrectEvmChain = useCallback(() => {
    if (!activeWallet) {
      return;
    }

    if (overrideIsWrongEvmNetworkWithPreferredChain && preferredChain) {
      const typedChainId = calculateTypedChainId(
        ChainType.EVM,
        preferredChain.id,
      );
      const targetChain = chainsPopulated[typedChainId];
      switchChain(targetChain, activeWallet);
      return;
    }

    if (!network.evmChainId) {
      return;
    }
    const typedChainId = calculateTypedChainId(
      ChainType.EVM,
      network.evmChainId,
    );
    const targetChain = chainsPopulated[typedChainId];
    switchChain(targetChain, activeWallet);
  }, [
    activeWallet,
    network.evmChainId,
    switchChain,
    overrideIsWrongEvmNetworkWithPreferredChain,
    preferredChain,
  ]);

  return (
    <div className="flex items-center gap-1">
      {isWrongEvmNetwork && (
        <Tooltip>
          <TooltipTrigger>
            <div
              className={cx(
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
          disableChainSelection={disableChainSelection}
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
  disableChainSelection?: boolean;
};

const TriggerButton: FC<TriggerButtonProps> = ({
  isLoading = false,
  networkName,
  className,
  disableChainSelection,
}) => {
  return (
    <DropdownBasicButton
      type="button"
      disabled={isLoading || disableChainSelection}
      className={cx(
        'flex items-center gap-2 rounded-lg p-2',
        'bg-transparent dark:bg-transparent',
        'hover:bg-mono-100/10 dark:hover:bg-mono-0/10',
        'border-2 border-mono-60 dark:border-mono-140',
        disableChainSelection &&
          'cursor-not-allowed pointer-events-none select-none border-mono-60/40 dark:border-mono-140/40',
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

        {!disableChainSelection && (
          <ChevronDown size="lg" className="shrink-0 grow-0" />
        )}
      </div>
    </DropdownBasicButton>
  );
};

export default NetworkSelectionButton;
