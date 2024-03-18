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
import { useMemo, useState } from 'react';

import isValidSubqueryEndpoint from '../NetworkSelector/isValidSubqueryEndpoint';
import { NetworkSelector } from '../NetworkSelector/NetworkSelector';

const ChainSelector = () => {
  const { notificationApi } = useWebbUI();
  const { activeChain, activeAccount } = useWebContext();

  const chain = useMemo(() => {
    if (activeChain) {
      return activeChain;
    }
  }, [activeChain]);

  const defaultNetworkType = webbNetworks.filter(
    (network) => network.networkType === 'testnet'
  );

  const [selectedNetwork, setSelectedNetwork] = useState((): Network => {
    const storedSelectedNetwork = localStorage.getItem('selectedNetwork');

    if (storedSelectedNetwork) {
      return JSON.parse(storedSelectedNetwork);
    }

    return defaultNetworkType[0].networks[0];
  });

  const [selectedNetworkType, setSelectedNetworkType] =
    useState<NetworkType>('testnet');

  const setUserSelectedNetwork = async (network: Network) => {
    const handleSuccess = () => {
      notificationApi({
        variant: 'success',
        message: `Connected to ${network.name}`,
      });
      localStorage.setItem('selectedNetwork', JSON.stringify(network));
      setSelectedNetwork(network);
    };

    const handleClose = () => {
      notificationApi({
        variant: 'error',
        message: `Please make sure you have a running node at the selected network.`,
      });
      localStorage.setItem(
        'selectedNetwork',
        JSON.stringify(defaultNetworkType[0].networks[0])
      );
      setSelectedNetwork(defaultNetworkType[0].networks[0]);
    };

    try {
      if (await isValidSubqueryEndpoint(network.subqueryEndpoint)) {
        const ws = new WebSocket(network.polkadotEndpoint);

        const handleOpen = () => {
          handleSuccess();
          ws.removeEventListener('open', handleOpen);
        };

        const handleCloseEvent = () => {
          handleClose();
          ws.removeEventListener('close', handleCloseEvent);
        };

        ws.addEventListener('open', handleOpen);
        ws.addEventListener('close', handleCloseEvent);
      } else {
        handleClose();
      }
    } catch (error) {
      handleClose();
    }
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

        <DropdownBody className="mt-1">
          <NetworkSelector
            selectedNetwork={selectedNetwork}
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
