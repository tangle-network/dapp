import { ChainIcon } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import {
  Network,
  TANGLE_LOCAL_DEV_NETWORK,
  TANGLE_MAINNET_NETWORK,
  TANGLE_TESTNET_NATIVE_NETWORK,
} from '@webb-tools/webb-ui-components/constants/networks';
import { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { InfoIconWithTooltip } from '../InfoIconWithTooltip';
import CustomRpcEndpointInput from './CustomRpcEndpointInput';
import { TANGLE_TESTNET_NATIVE_CHAIN_NAME } from './NetworkSelectionButton';

export type NetworkSelectorDropdownProps = {
  selectedNetwork: Network | null;
  isCustomEndpointSelected: boolean;
  onSetCustomNetwork: (customRpcEndpoint: string) => void;
  onNetworkChange: (network: Network) => void;
};

// TODO: Ideally, consider merging this with the `stats-dapp`'s usage, into a single component from the Webb UI library, and then re-use it in both places.
export const NetworkSelectorDropdown: FC<NetworkSelectorDropdownProps> = ({
  selectedNetwork,
  isCustomEndpointSelected,
  onSetCustomNetwork,
  onNetworkChange,
}) => {
  return (
    <div className="flex flex-col items-center justify-between gap-2 py-1">
      {/* Mainnet network */}
      <NetworkOption
        isSelected={selectedNetwork?.name === TANGLE_MAINNET_NETWORK.name}
        name={TANGLE_MAINNET_NETWORK.name}
        onClick={() => onNetworkChange(TANGLE_MAINNET_NETWORK)}
      />

      {/* Testnet network */}
      <NetworkOption
        isSelected={
          selectedNetwork?.name === TANGLE_TESTNET_NATIVE_NETWORK.name
        }
        name={TANGLE_TESTNET_NATIVE_NETWORK.name}
        onClick={() => onNetworkChange(TANGLE_TESTNET_NATIVE_NETWORK)}
      />

      <hr className="w-full border border-mono-40 dark:border-mono-120" />

      {/* Local dev network */}
      <NetworkOption
        isSelected={selectedNetwork?.name === TANGLE_LOCAL_DEV_NETWORK.name}
        name={TANGLE_LOCAL_DEV_NETWORK.name}
        onClick={() => onNetworkChange(TANGLE_LOCAL_DEV_NETWORK)}
      />

      {/* Custom network */}
      <NetworkOption
        isSelected={isCustomEndpointSelected}
        name="Custom endpoint"
        tooltip="Connect to a custom network by specifying its RPC endpoint URL"
      />

      <div className="pb-2">
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
  const handleClick = () => {
    if (isSelected || onClick === undefined) {
      return;
    }

    onClick();
  };

  return (
    <div
      onClick={handleClick}
      className={twMerge(
        'flex gap-2 w-full py-2 px-4',
        onClick !== undefined &&
          'cursor-pointer hover:bg-mono-20 hover:dark:bg-mono-140',
        isSelected && 'bg-mono-20 dark:bg-mono-140 cursor-default'
      )}
    >
      <ChainIcon size="lg" name={TANGLE_TESTNET_NATIVE_CHAIN_NAME} />

      <Typography variant="body1" fw="semibold" className="dark:text-mono-0">
        {name}
      </Typography>

      {tooltip !== undefined && (
        <InfoIconWithTooltip
          className="!max-w-[200px]"
          content={<>{tooltip}</>}
        />
      )}
    </div>
  );
};
