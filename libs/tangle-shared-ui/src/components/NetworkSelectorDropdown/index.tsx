'use client';

import { Root as DropdownRoot } from '@radix-ui/react-dropdown-menu';
import { useWebContext } from '@tangle-network/api-provider-environment';
import { ChainConfig, chainsPopulated } from '@tangle-network/dapp-config';
import {
  calculateTypedChainId,
  ChainType,
} from '@tangle-network/dapp-types/TypedChainId';
import { Alert, ChainIcon, Spinner } from '@tangle-network/icons';
import {
  DropdownBody,
  DropdownButton,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@tangle-network/ui-components';
import cx from 'classnames';
import { type FC, useCallback, useMemo, useState } from 'react';
import useNetworkStore from '../../context/useNetworkStore';
import useSwitchNetwork from '../../hooks/useSwitchNetwork';
import createCustomNetwork from '../../utils/createCustomNetwork';
import { NetworkSelectorDropdown } from './NetworkSelectorDropdown';
import {
  Network,
  NetworkId,
} from '@tangle-network/ui-components/constants/networks';

type NetworkSelectionButtonProps = {
  disableChainSelection?: boolean;
  preferredChain?: ChainConfig;
};

const NetworkSelectionButton: FC<NetworkSelectionButtonProps> = ({
  disableChainSelection = false,
  preferredChain,
}) => {
  const { activeChain, activeWallet, isConnecting, loading, switchChain } =
    useWebContext();

  const network = useNetworkStore((store) => store.network2);
  const { switchNetwork, isCustom } = useSwitchNetwork();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [switchingNetworkId, setSwitchingNetworkId] = useState<
    NetworkId | null | 'custom'
  >(null);

  // TODO: Handle switching network on EVM wallet here.
  const handleSwitchCustomNetwork = useCallback(
    async (customRpcEndpoint: string) => {
      setSwitchingNetworkId('custom');

      await switchNetwork(createCustomNetwork(customRpcEndpoint), true);

      setSwitchingNetworkId(null);
    },
    [switchNetwork],
  );

  const handleNetworkChange = useCallback(
    async (newNetwork: Network, event: Event) => {
      event.preventDefault();
      setSwitchingNetworkId(newNetwork.id);

      await switchNetwork(newNetwork, false);

      setIsDropdownOpen(false);
      setSwitchingNetworkId(null);
    },
    [switchNetwork],
  );

  const networkName = useMemo(
    () => {
      if (isConnecting) {
        return 'Connecting';
      } else if (loading) {
        return 'Loading';
      }

      const UNKNOWN_NETWORK = 'Unknown Network';

      if (disableChainSelection) {
        return activeChain?.name === 'Tangle Mainnet'
          ? activeChain.name
          : (activeChain?.displayName ??
              activeChain?.name ??
              network?.name ??
              UNKNOWN_NETWORK);
      }

      return (
        activeChain?.displayName ??
        activeChain?.name ??
        network?.name ??
        UNKNOWN_NETWORK
      );
    },
    // prettier-ignore
    [isConnecting, loading, disableChainSelection, network?.name, activeChain?.displayName, activeChain?.name],
  );

  const isWrongEvmNetwork = useMemo(() => {
    const isEvmWallet = activeWallet?.platform === 'EVM';

    if (!isEvmWallet || preferredChain) {
      return false;
    }

    return (
      network?.evmChainId !== undefined &&
      network.evmChainId !== activeChain?.id
    );
  }, [
    activeChain?.id,
    activeWallet?.platform,
    network?.evmChainId,
    preferredChain,
  ]);

  const switchToCorrectEvmChain = useCallback(() => {
    if (!activeWallet) {
      return;
    }

    if (!network?.evmChainId) {
      return;
    }
    const typedChainId = calculateTypedChainId(
      ChainType.EVM,
      network.evmChainId,
    );
    const targetChain = chainsPopulated[typedChainId];
    switchChain(targetChain, activeWallet);
  }, [activeWallet, network?.evmChainId, switchChain]);

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

          <TooltipBody>
            Switch to {preferredChain ? 'selected' : 'required'} network
          </TooltipBody>
        </Tooltip>
      )}

      <DropdownRoot open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <TriggerButton
          isLoading={isConnecting || loading}
          networkName={networkName}
          className="overflow-hidden"
          disableChainSelection={disableChainSelection}
        />

        <DropdownBody isPortal className="mt-2">
          <NetworkSelectorDropdown
            switchingNetworkId={switchingNetworkId}
            isCustomEndpointSelected={isCustom}
            selectedNetwork={network}
            onSetCustomNetwork={handleSwitchCustomNetwork}
            onNetworkChange={handleNetworkChange}
            isNotConnectedToSelectedNetwork={isWrongEvmNetwork}
          />
        </DropdownBody>
      </DropdownRoot>
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
    <DropdownButton
      type="button"
      disabled={isLoading || disableChainSelection}
      className={cx(
        disableChainSelection &&
          'cursor-not-allowed pointer-events-none select-none border-mono-60/40 dark:border-mono-140/40',
        className,
      )}
      icon={
        isLoading ? (
          <Spinner size="lg" />
        ) : (
          <ChainIcon size="lg" className="shrink-0 grow-0" name={networkName} />
        )
      }
      isHideArrowIcon={disableChainSelection}
    >
      <Typography
        variant="body1"
        fw="bold"
        className="hidden dark:text-mono-0 sm:block"
      >
        {networkName}
      </Typography>
    </DropdownButton>
  );
};

export default NetworkSelectionButton;
