import { ChainIcon, StatusIndicator } from '@tangle-network/icons';
import {
  DropdownMenuItem,
  InfoIconWithTooltip,
  Typography,
} from '@tangle-network/webb-ui-components';
import {
  Network,
  TANGLE_LOCAL_DEV_NETWORK,
  TANGLE_MAINNET_NETWORK,
  TANGLE_TESTNET_NATIVE_NETWORK,
} from '@tangle-network/webb-ui-components/constants/networks';
import { FC, ReactNode, useCallback } from 'react';

import CustomRpcEndpointInput from './CustomRpcEndpointInput';

export type NetworkSelectorDropdownProps = {
  selectedNetwork: Network | null;
  isCustomEndpointSelected: boolean;
  onSetCustomNetwork: (customRpcEndpoint: string) => void;
  onNetworkChange: (network: Network) => void;
};

export const NetworkSelectorDropdown: FC<NetworkSelectorDropdownProps> = ({
  selectedNetwork,
  isCustomEndpointSelected,
  onSetCustomNetwork,
  onNetworkChange,
}) => {
  return (
    <div className="flex flex-col items-center justify-between">
      {/* Tangle Mainnet */}
      <NetworkOption
        isSelected={selectedNetwork?.id === TANGLE_MAINNET_NETWORK.id}
        name={TANGLE_MAINNET_NETWORK.name}
        onClick={() => onNetworkChange(TANGLE_MAINNET_NETWORK)}
      />

      {/* Tangle Testnet */}
      <NetworkOption
        isSelected={selectedNetwork?.id === TANGLE_TESTNET_NATIVE_NETWORK.id}
        name={TANGLE_TESTNET_NATIVE_NETWORK.name}
        onClick={() => onNetworkChange(TANGLE_TESTNET_NATIVE_NETWORK)}
      />

      <hr className="w-full h-0 border-t border-mono-40 dark:border-mono-120" />

      {/* Tangle Local Dev */}
      <NetworkOption
        isSelected={selectedNetwork?.id === TANGLE_LOCAL_DEV_NETWORK.id}
        name={TANGLE_LOCAL_DEV_NETWORK.name}
        onClick={() => onNetworkChange(TANGLE_LOCAL_DEV_NETWORK)}
      />

      {/* Custom network */}
      <NetworkOption
        isSelected={isCustomEndpointSelected}
        name="Custom endpoint"
        tooltip="Connect to a custom network by specifying its RPC endpoint URL"
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
  tooltip?: ReactNode;
  onClick?: () => void;
};

const NetworkOption: FC<NetworkOptionProps> = ({
  name,
  isSelected,
  tooltip,
  onClick,
}) => {
  const handleClick = useCallback(() => {
    if (isSelected || onClick === undefined) {
      return;
    }

    onClick();
  }, [isSelected, onClick]);

  return (
    <DropdownMenuItem
      leftIcon={<ChainIcon size="lg" name={name} />}
      onClick={handleClick}
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

        {isSelected && <StatusIndicator variant="success" />}
      </div>
    </DropdownMenuItem>
  );
};
