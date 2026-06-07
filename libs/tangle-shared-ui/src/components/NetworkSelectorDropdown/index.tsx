'use client';

import { Root as DropdownRoot } from '@radix-ui/react-dropdown-menu';
import { Alert, ChainIcon, Spinner } from '@tangle-network/icons';
import {
  DropdownBody,
  DropdownButton,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@tangle-network/ui-components';
import {
  Network,
  NetworkId,
} from '@tangle-network/ui-components/constants/networks';
import cx from 'classnames';
import { type FC, useCallback, useMemo, useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import useNetworkStore from '../../context/useNetworkStore';
import { NetworkSelectorDropdown } from './NetworkSelectorDropdown';
import createCustomNetwork from '../../utils/createCustomNetwork';
import { notificationApi } from '@tangle-network/ui-components';

type NetworkSelectionButtonProps = {
  disableChainSelection?: boolean;
  /**
   * List of networks to display in the dropdown.
   * Defaults to Tangle Mainnet, Testnet, and Local Dev networks.
   */
  networks?: Network[];
  /**
   * Whether to show the custom endpoint input.
   * Defaults to true.
   */
  showCustomEndpoint?: boolean;
};

const NetworkSelectionButton: FC<NetworkSelectionButtonProps> = ({
  disableChainSelection = false,
  networks,
  showCustomEndpoint,
}) => {
  const { isConnecting: isWalletConnecting, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const network = useNetworkStore((store) => store.network2);
  const setNetwork = useNetworkStore((store) => store.setNetwork);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [switchingNetworkId, setSwitchingNetworkId] = useState<
    NetworkId | null | 'custom'
  >(null);
  const [isCustom, setIsCustom] = useState(false);

  const handleSwitchCustomNetwork = useCallback(
    async (customRpcEndpoint: string) => {
      setSwitchingNetworkId('custom');
      const customNetwork = createCustomNetwork(customRpcEndpoint);
      setNetwork(customNetwork);
      setIsCustom(true);
      setSwitchingNetworkId(null);
    },
    [setNetwork],
  );

  const handleNetworkChange = useCallback(
    async (newNetwork: Network, event: Event) => {
      event.preventDefault();
      setSwitchingNetworkId(newNetwork.id);

      // If connected and network has an EVM chain ID, switch the chain
      if (isConnected && newNetwork.evmChainId && switchChain) {
        try {
          switchChain({ chainId: newNetwork.evmChainId });
        } catch (error) {
          console.error('Failed to switch chain:', error);
          notificationApi({
            variant: 'error',
            message: 'Failed to switch network',
          });
        }
      }

      setNetwork(newNetwork);
      setIsCustom(false);
      setIsDropdownOpen(false);
      setSwitchingNetworkId(null);
    },
    [isConnected, setNetwork, switchChain],
  );

  const networkName = useMemo(() => {
    if (isWalletConnecting || isSwitchingChain) {
      return 'Connecting';
    }

    return network?.name ?? 'Unknown Network';
  }, [isWalletConnecting, isSwitchingChain, network?.name]);

  // Check if wallet is on wrong chain
  const isWrongEvmNetwork = useMemo(() => {
    if (!isConnected || !network?.evmChainId) {
      return false;
    }
    return network.evmChainId !== chainId;
  }, [isConnected, network, chainId]);

  const switchToCorrectEvmChain = useCallback(() => {
    if (!network?.evmChainId || !switchChain) {
      return;
    }
    switchChain({ chainId: network.evmChainId });
  }, [network, switchChain]);

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

          <TooltipBody>Switch to required network</TooltipBody>
        </Tooltip>
      )}

      <DropdownRoot open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <TriggerButton
          isLoading={isWalletConnecting || isSwitchingChain}
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
            networks={networks}
            showCustomEndpoint={showCustomEndpoint}
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
