import { assert } from '@polkadot/util/assert';
import { TangleIcon } from '@webb-tools/icons';
import {
  RadioGroup,
  RadioItem,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import {
  Network,
  NetworkType,
  webbNetworks,
} from '@webb-tools/webb-ui-components/constants';
import { FC, useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import useRpcEndpointStore from '../../context/useRpcEndpointStore';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { InfoIconWithTooltip } from '../InfoIconWithTooltip';
import EndpointInput from './EndpointInput';
import isNetworkTypeDisabled from './isNetworkTypeDisabled';
import testRpcEndpointConnection from './testRpcEndpointConnection';

const NETWORK_TYPES = ['live', 'testnet', 'dev'] as const;

// Use the testnet as the default network.
const DEFAULT_NETWORK_DEF = webbNetworks.find(
  (network) => network.networkType === 'testnet'
);

assert(
  DEFAULT_NETWORK_DEF !== undefined,
  'Default network definition should exist'
);

const DEFAULT_NETWORK = DEFAULT_NETWORK_DEF.networks.at(0);

assert(DEFAULT_NETWORK !== undefined, 'Default network should exist');

const CUSTOM_NETWORK_VALUE = 'Custom Network';

// TODO: Ideally, consider merging this with the `stats-dapp`'s usage, into a single component from the Webb UI library, and then re-use it in both places.
export const NetworkSelector: FC = () => {
  const [network, setNetwork] = useState<Network>(DEFAULT_NETWORK);
  const { notificationApi } = useWebbUI();
  const { rpcEndpoint, setRpcEndpoint } = useRpcEndpointStore();

  const { set: setCachedRpcEndpoint } = useLocalStorage(
    LocalStorageKey.CUSTOM_RPC_ENDPOINT
  );

  // TODO: Use network type from local storage if it exists.

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

      // This should trigger a re-render of all places that use the
      // RPC endpoint, leading them to re-connect to the new endpoint.
      setRpcEndpoint(customRpcEndpoint);

      // Save it to local storage for future use.
      setCachedRpcEndpoint(customRpcEndpoint);

      setNetwork({
        name: CUSTOM_NETWORK_VALUE,
        networkType: 'dev',
        networkNodeType: 'standalone',
        subqueryEndpoint: '',
        polkadotEndpoint: customRpcEndpoint,
        polkadotExplorer: `https://polkadot.js.org/apps/?rpc=${rpcEndpoint}#/explorer`,
        avatar: '',
      });
    },
    [notificationApi, rpcEndpoint, setCachedRpcEndpoint, setRpcEndpoint]
  );

  const networksMatchingType = useMemo(
    () =>
      webbNetworks.filter(
        (network) => network.networkType === network.networkType
      ),
    []
  );

  const handleNetworkTypeChange = (newNetworkTypeValue: string) => {
    console.debug('newNetworkTypeValue:', newNetworkTypeValue);

    // If the custom network is selected, set the custom network.
    if (newNetworkTypeValue === CUSTOM_NETWORK_VALUE) {
      return;
    }

    const newNetworkType: NetworkType = z
      .enum(NETWORK_TYPES)
      .parse(newNetworkTypeValue);

    const networkDefMatchingNewType = webbNetworks.find(
      (network) => network.networkType === newNetworkType
    );

    assert(
      networkDefMatchingNewType !== undefined,
      'There should be at least one network definition matching the new type'
    );

    const network = networkDefMatchingNewType.networks.at(0);

    assert(
      network !== undefined,
      'There should be at least one network matching the new type'
    );

    console.debug(
      'Changing to known network:',
      network.name,
      network.networkType,
      network.networkNodeType
    );

    setRpcEndpoint(network.polkadotEndpoint);
    setNetwork(network);
  };

  const customNetworkConfig = useMemo(
    () => (
      <>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <RadioItem id="custom-network" value={CUSTOM_NETWORK_VALUE}>
              Custom Network
            </RadioItem>

            <InfoIconWithTooltip
              content={
                <span className="text-sm">
                  Example endpoints:
                  <br />
                  Subquery: http://localhost:4000/graphql
                  <br />
                  Polkadot: ws://127.0.0.1:9944
                </span>
              }
            />
          </div>

          <TangleIcon size="lg" />
        </div>

        <div className="flex flex-col space-y-2.5">
          <EndpointInput
            id="custom-rpc-endpoint"
            placeholder="RPC endpoint URL"
            setCustomNetwork={trySetCustomNetwork}
          />
        </div>
      </>
    ),
    [trySetCustomNetwork]
  );

  return (
    <div className="p-4">
      {/* Options & configuration */}
      <RadioGroup
        className="pb-4"
        defaultValue={network.name}
        // Mark it as selected if the current network's name
        // matches the option's value.
        value={network.name}
        onValueChange={handleNetworkTypeChange}
      >
        <div className="flex flex-col space-y-4">
          {networksMatchingType[0].networks.map((network) => (
            <div key={network.name} className="flex items-center gap-2">
              <RadioItem id={network.name} value={network.name}>
                {network.name}
              </RadioItem>

              {network.networkType !== 'dev' && <TangleIcon size="lg" />}
            </div>
          ))}

          {network.networkType === 'dev' && customNetworkConfig}
        </div>
      </RadioGroup>

      {/* Network type listing */}
      <RadioGroup
        defaultValue={network.networkType}
        value={network.networkType}
        onValueChange={handleNetworkTypeChange}
        className="pb-2 border-t border-mono-40 dark:border-mono-140"
      >
        <div className="mt-4 flex items-center justify-between">
          {NETWORK_TYPES.map((networkType) => (
            <RadioItem
              key={networkType}
              id={networkType}
              value={networkType}
              overrideRadixRadioItemProps={{
                disabled: isNetworkTypeDisabled(networkType),
              }}
            >
              {networkType}
            </RadioItem>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};
