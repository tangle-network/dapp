import {
  ChainIcon,
  SettingsFillIcon,
  Spinner,
  StatusIndicator,
} from '@tangle-network/icons';
import {
  Divider,
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

// Default networks for the main Tangle dApp
const DEFAULT_NETWORKS: Network[] = [
  TANGLE_MAINNET_NETWORK,
  TANGLE_TESTNET_NATIVE_NETWORK,
  TANGLE_LOCAL_DEV_NETWORK,
];

export type NetworkSelectorDropdownProps = {
  selectedNetwork: Network | undefined;
  isCustomEndpointSelected: boolean;
  switchingNetworkId: NetworkId | null | 'custom';
  onSetCustomNetwork: (customRpcEndpoint: string) => void;
  onNetworkChange: (network: Network, event: Event) => void;
  isNotConnectedToSelectedNetwork: boolean;
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

export const NetworkSelectorDropdown: FC<NetworkSelectorDropdownProps> = ({
  selectedNetwork,
  isCustomEndpointSelected,
  switchingNetworkId,
  onSetCustomNetwork,
  onNetworkChange,
  isNotConnectedToSelectedNetwork,
  networks = DEFAULT_NETWORKS,
  showCustomEndpoint = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-between">
      {networks.map((network) => (
        <NetworkOption
          key={network.id}
          isSwitching={switchingNetworkId === network.id}
          isSelected={selectedNetwork?.id === network.id}
          name={network.name}
          onSelect={(event) => onNetworkChange(network, event)}
          isNotConnected={isNotConnectedToSelectedNetwork}
        />
      ))}

      {showCustomEndpoint && (
        <>
          <Divider className="dark:bg-mono-120" />

          {/* Custom network */}
          <NetworkOption
            isSwitching={switchingNetworkId === 'custom'}
            isSelected={isCustomEndpointSelected}
            name="Custom endpoint"
            icon={<SettingsFillIcon size="lg" />}
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
        </>
      )}
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
  const statusIcon = isSelected ? (
    <StatusIndicator variant={isNotConnected ? 'warning' : 'success'} />
  ) : undefined;

  return (
    <DropdownMenuItem
      leftIcon={
        isSwitching ? (
          <Spinner size="lg" />
        ) : (
          (icon ?? <ChainIcon size="lg" name={name} />)
        )
      }
      rightIcon={statusIcon}
      onSelect={onSelect}
      disabled={isSelected}
      className="w-full py-3"
    >
      <div className="flex items-center gap-2">
        <Typography variant="body1" fw="semibold" className="dark:text-mono-0">
          {name}
        </Typography>

        {tooltip !== undefined && <InfoIconWithTooltip content={tooltip} />}
      </div>
    </DropdownMenuItem>
  );
};
