'use client';

import { useWebContext } from '@webb-tools/api-provider-environment/webb-context/webb-context';
import { ChainIcon, ChevronDown } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

import createCustomNetwork from './createCustomNetwork';
import { NetworkSelectorDropdown } from './NetworkSelectorDropdown';
import testRpcEndpointConnection from './testRpcEndpointConnection';
import useNetworkState from './useNetworkState';

// TODO: Currently hard-coded, but shouldn't it always be the Tangle icon, since it's not switching chains but rather networks within Tangle? If so, find some constant somewhere instead of having it hard-coded here.
export const TANGLE_TESTNET_NATIVE_CHAIN_NAME = 'Tangle Testnet Native';

const NetworkSelectionButton: FC = () => {
  const { activeChain, activeAccount } = useWebContext();
  const { notificationApi } = useWebbUI();
  const { network, setNetwork, isCustom } = useNetworkState();

  const trySetCustomNetwork = useCallback(
    async (customRpcEndpoint: string) => {
      if (!(await testRpcEndpointConnection(customRpcEndpoint))) {
        notificationApi({
          variant: 'error',
          message: `Unable to connect to the requested network: ${customRpcEndpoint}`,
        });

        return;
      }

      notificationApi({
        variant: 'success',
        message: `Connected to ${customRpcEndpoint}`,
      });

      setNetwork(createCustomNetwork(customRpcEndpoint), true);
    },
    [notificationApi, setNetwork]
  );

  return (
    activeAccount &&
    activeChain && (
      <Dropdown>
        <DropdownBasicButton>
          <TriggerButton networkName={network?.name ?? 'Loading'} />
        </DropdownBasicButton>

        <DropdownBody className="mt-1 bg-mono-0 dark:bg-mono-180">
          <NetworkSelectorDropdown
            isCustomEndpointSelected={isCustom}
            selectedNetwork={network}
            onSetCustomNetwork={trySetCustomNetwork}
            onNetworkChange={(newNetwork) => setNetwork(newNetwork, false)}
          />
        </DropdownBody>
      </Dropdown>
    )
  );
};

const TriggerButton: FC<{ networkName: string }> = ({ networkName }) => {
  return (
    <button
      type="button"
      className={twMerge(
        'rounded-lg border-2 p-2 pl-4',
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
