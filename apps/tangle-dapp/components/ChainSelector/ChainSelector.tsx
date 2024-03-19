'use client';

import { useWebContext } from '@webb-tools/api-provider-environment/webb-context/webb-context';
import { StatusVariant } from '@webb-tools/icons/StatusIndicator/types';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import ChainButtonCmp from '@webb-tools/webb-ui-components/components/buttons/ChainButton';
import {
  Network,
  NetworkType,
  webbNetworks,
} from '@webb-tools/webb-ui-components/constants';
import { useState } from 'react';

import useRpcEndpointStore from '../../context/useRpcEndpointStore';
import { NetworkSelector } from '../NetworkSelector/NetworkSelector';

const ChainSelector = () => {
  const { notificationApi } = useWebbUI();
  const { activeChain, activeAccount } = useWebContext();
  const chain = activeChain ?? undefined;

  const defaultNetworkType = webbNetworks.filter(
    (network) => network.networkType === 'testnet'
  );

  const { rpcEndpoint: activeRpcEndpoint } = useRpcEndpointStore();

  const [selectedNetworkType, setSelectedNetworkType] =
    useState<NetworkType>('testnet');

  const setUserSelectedNetwork = async (network: Network) => {
    const notifyConnected = () => {
      notificationApi({
        variant: 'success',
        message: `Connected to ${network.name}`,
      });
    };

    const notifyConnectionFailed = () => {
      notificationApi({
        variant: 'error',
        message: `Unable to connect to the requested network: ${network.name}`,
      });
    };
  };

  const status: StatusVariant =
    activeChain === null
      ? 'warning'
      : activeChain === undefined
      ? 'error'
      : 'success';

  return (
    activeAccount &&
    chain && (
      <Dropdown>
        <DropdownBasicButton>
          <ChainButtonCmp
            chain={chain}
            status={status}
            placeholder={activeChain === null ? 'Unsupported Chain' : undefined}
            textClassname="hidden lg:block"
          />
        </DropdownBasicButton>

        <DropdownBody className="mt-1 bg-mono-0 dark:bg-mono-180">
          <NetworkSelector
            setUserSelectedNetwork={setUserSelectedNetwork}
            selectedNetworkType={selectedNetworkType}
            setSelectedNetworkType={setSelectedNetworkType}
          />
        </DropdownBody>
      </Dropdown>
    )
  );
};

export default ChainSelector;
