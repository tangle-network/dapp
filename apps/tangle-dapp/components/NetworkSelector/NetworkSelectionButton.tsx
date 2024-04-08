'use client';

import { ChainIcon, ChevronDown } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

import useNetworkState from '../../hooks/useNetworkState';
import createCustomNetwork from '../../utils/createCustomNetwork';
import { NetworkSelectorDropdown } from './NetworkSelectorDropdown';

// TODO: Currently hard-coded, but shouldn't it always be the Tangle icon, since it's not switching chains but rather networks within Tangle? If so, find some constant somewhere instead of having it hard-coded here.
export const TANGLE_TESTNET_NATIVE_CHAIN_NAME = 'Tangle Testnet Native';

const NetworkSelectionButton: FC = () => {
  const { network, setNetwork, isCustom } = useNetworkState();

  const switchToCustomNetwork = useCallback(
    async (customRpcEndpoint: string) =>
      setNetwork(createCustomNetwork(customRpcEndpoint), true),
    [setNetwork]
  );

  return (
    <Dropdown>
      <DropdownBasicButton>
        <TriggerButton networkName={network?.name ?? 'Loading'} />
      </DropdownBasicButton>

      <DropdownBody className="mt-1 bg-mono-0 dark:bg-mono-180">
        <NetworkSelectorDropdown
          isCustomEndpointSelected={isCustom}
          selectedNetwork={network}
          onSetCustomNetwork={switchToCustomNetwork}
          onNetworkChange={(newNetwork) => setNetwork(newNetwork, false)}
        />
      </DropdownBody>
    </Dropdown>
  );
};

const TriggerButton: FC<{ networkName: string }> = ({ networkName }) => {
  return (
    <button
      type="button"
      className={twMerge(
        'rounded-lg border-2 p-2',
        'bg-mono-0/10 border-mono-60',
        'hover:bg-mono-0/30',
        'dark:bg-mono-0/5 dark:border-mono-140',
        'dark:hover:bg-mono-0/10',
        'flex items-center gap-2'
      )}
    >
      <ChainIcon
        status="success"
        size="lg"
        className="shrink-0 grow-0"
        name={TANGLE_TESTNET_NATIVE_CHAIN_NAME}
      />

      <div className="flex items-center gap-0">
        <Typography variant="body1" fw="bold" className="dark:text-mono-0">
          {networkName}
        </Typography>

        <ChevronDown size="lg" className="shrink-0 grow-0" />
      </div>
    </button>
  );
};

export default NetworkSelectionButton;
