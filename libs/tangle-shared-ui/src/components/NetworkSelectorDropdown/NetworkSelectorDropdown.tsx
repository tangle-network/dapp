import { ChainIcon, Spinner, StatusIndicator } from '@tangle-network/icons';
import {
  DropdownMenuItem,
  InfoIconWithTooltip,
  Typography,
} from '@tangle-network/ui-components';
import {
  Network,
  NetworkId,
  TANGLE_LOCAL_DEV_NETWORK,
  TANGLE_MAINNET_NETWORK,
  TANGLE_TESTNET_NATIVE_NETWORK,
} from '@tangle-network/ui-components/constants/networks';
import { FC, ReactElement, ReactNode } from 'react';

import CustomRpcEndpointInput from './CustomRpcEndpointInput';
import { GearIcon } from '@radix-ui/react-icons';

export type NetworkSelectorDropdownProps = {
  selectedNetwork: Network | undefined;
  isCustomEndpointSelected: boolean;
  switchingNetworkId: NetworkId | null | 'custom';
  onSetCustomNetwork: (customRpcEndpoint: string) => void;
  onNetworkChange: (network: Network, event: Event) => void;
  isNotConnectedToSelectedNetwork: boolean;
};

export const NetworkSelectorDropdown: FC<NetworkSelectorDropdownProps> = ({
  selectedNetwork,
  isCustomEndpointSelected,
  switchingNetworkId,
  onSetCustomNetwork,
  onNetworkChange,
  isNotConnectedToSelectedNetwork,
}) => {
  return (
    <div className="flex flex-col items-center justify-between">
      {/* Tangle Mainnet */}
      <NetworkOption
        isSwitching={switchingNetworkId === TANGLE_MAINNET_NETWORK.id}
        isSelected={selectedNetwork?.id === TANGLE_MAINNET_NETWORK.id}
        name={TANGLE_MAINNET_NETWORK.name}
        onSelect={(event) => onNetworkChange(TANGLE_MAINNET_NETWORK, event)}
        isNotConnected={isNotConnectedToSelectedNetwork}
      />

      {/* Tangle Testnet */}
      <NetworkOption
        isSwitching={switchingNetworkId === TANGLE_TESTNET_NATIVE_NETWORK.id}
        isSelected={selectedNetwork?.id === TANGLE_TESTNET_NATIVE_NETWORK.id}
        name={TANGLE_TESTNET_NATIVE_NETWORK.name}
        onSelect={(event) =>
          onNetworkChange(TANGLE_TESTNET_NATIVE_NETWORK, event)
        }
        isNotConnected={isNotConnectedToSelectedNetwork}
      />

      <hr className="w-full h-0 border-t border-mono-40 dark:border-mono-120" />

      {/* Tangle Local Dev */}
      <NetworkOption
        isSwitching={switchingNetworkId === TANGLE_LOCAL_DEV_NETWORK.id}
        isSelected={selectedNetwork?.id === TANGLE_LOCAL_DEV_NETWORK.id}
        name={TANGLE_LOCAL_DEV_NETWORK.name}
        onSelect={(event) => onNetworkChange(TANGLE_LOCAL_DEV_NETWORK, event)}
        isNotConnected={isNotConnectedToSelectedNetwork}
      />

      {/* Custom network */}
      <NetworkOption
        isSwitching={switchingNetworkId === 'custom'}
        isSelected={isCustomEndpointSelected}
        name="Custom endpoint"
        icon={<GearIcon className="size-6" />}
        tooltip="Connect to a custom network by specifying its RPC endpoint URL"
        isNotConnected={isNotConnectedToSelectedNetwork}
      />

      <div className="w-full px-4 pt-1 pb-2">
        <CustomRpcEndpointInput
          id="custom-rpc-endpoint"
          placeholder="RPC endpoint URL"
          setCustomNetwork={onSetCustomNetwork}
        />
      </div>
    </div>
  );
};

type NetworkOptionProps = {
  name: string;
  isSelected: boolean;
  isSwitching: boolean;
  isNotConnected: boolean;
  icon?: ReactElement;
  tooltip?: ReactNode;
  onSelect?: (event: Event) => void;
};

const NetworkOption: FC<NetworkOptionProps> = ({
  name,
  isSelected,
  isSwitching,
  isNotConnected,
  icon,
  tooltip,
  onSelect,
}) => {
  return (
    <DropdownMenuItem
      leftIcon={
        isSwitching ? (
          <Spinner size="lg" />
        ) : (
          (icon ?? <ChainIcon size="lg" name={name} />)
        )
      }
      onSelect={onSelect}
      disabled={isSelected}
      className="flex justify-between w-full py-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography
            variant="body1"
            fw="semibold"
            className="dark:text-mono-0"
          >
            {name}
          </Typography>

          {tooltip !== undefined && <InfoIconWithTooltip content={tooltip} />}
        </div>

        {isSelected && isNotConnected ? (
          <StatusIndicator variant="warning" />
        ) : isSelected && !isNotConnected ? (
          <StatusIndicator variant="success" />
        ) : null}
      </div>
    </DropdownMenuItem>
  );
};
