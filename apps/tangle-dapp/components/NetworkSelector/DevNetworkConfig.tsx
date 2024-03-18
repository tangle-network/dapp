import { TangleIcon } from '@webb-tools/icons';
import { RadioItem } from '@webb-tools/webb-ui-components';
import {
  Network,
  NetworkType,
  webbNetworks,
} from '@webb-tools/webb-ui-components/constants';
import assert from 'assert';
import { FC, useState } from 'react';

import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { InfoIconWithTooltip } from '../InfoIconWithTooltip';
import EndpointInput from './EndpointInput';
import isValidPolkadotEndpoint from './isValidPolkadotEndpoint';
import isValidSubqueryEndpoint from './isValidSubqueryEndpoint';

export type DevNetworkConfigProps = {
  selectedNetwork: Network;
  selectedNetworkType: NetworkType;
  setUserSelectedNetwork: (network: Network) => void;
  setSelectedNetworkType: (networkType: NetworkType) => void;
};

const DevNetworkConfig: FC<DevNetworkConfigProps> = ({
  selectedNetwork,
  selectedNetworkType,
  setUserSelectedNetwork,
  setSelectedNetworkType,
}) => {
  const { value: cachedSubqueryEndpoint, remove: removeSubqueryEndpoint } =
    useLocalStorage(LocalStorageKey.CUSTOM_SUBQUERY_ENDPOINT);

  const { value: cachedPolkadotEndpoint, remove: removePolkadotEndpoint } =
    useLocalStorage(LocalStorageKey.CUSTOM_SUBQUERY_ENDPOINT);

  const [savedEndpoints, setSavedEndpoints] = useState({
    // Use the cached values from local storage, if available.
    // Otherwise, default to an empty string.
    subqueryEndpoint: cachedSubqueryEndpoint ?? '',
    polkadotEndpoint: cachedPolkadotEndpoint ?? '',
  });

  const [subqueryEndpoint, setSubqueryEndpoint] = useState(
    savedEndpoints.subqueryEndpoint ?? ''
  );

  const [polkadotEndpoint, setPolkadotEndpoint] = useState(
    savedEndpoints.polkadotEndpoint ?? ''
  );

  const [isSubqueryEndpointValid, setIsSubqueryEndpointValid] = useState(true);
  const [isPolkadotEndpointValid, setIsPolkadotEndpointValid] = useState(true);

  const setDefaultEndpointsAsUserSelected = () => {
    if (
      selectedNetwork.name !== 'Custom Network' ||
      localStorage.getItem(LocalStorageKey.CUSTOM_SUBQUERY_ENDPOINT) === null ||
      localStorage.getItem(LocalStorageKey.CUSTOM_POLKADOT_ENDPOINT) === null
    ) {
      return;
    }

    const defaultNetworkType = webbNetworks.find(
      (network) => network.networkType === 'testnet'
    );

    assert(
      defaultNetworkType !== undefined,
      'Testnet network type entry should exist'
    );

    const defaultNetwork = defaultNetworkType.networks.at(0);

    assert(
      defaultNetwork !== undefined,
      'There should be at least a single network entry for testnet'
    );

    setUserSelectedNetwork(defaultNetwork);
    setSelectedNetworkType('testnet');
  };

  const handleDeleteSubqueryEndpoint = () => {
    setDefaultEndpointsAsUserSelected();
    removeSubqueryEndpoint();

    setSavedEndpoints({
      ...savedEndpoints,
      subqueryEndpoint: '',
    });

    setSubqueryEndpoint('');
  };

  const handleSaveSubqueryEndpoint = async () => {
    if (!(await isValidSubqueryEndpoint(subqueryEndpoint))) {
      localStorage.setItem(LocalStorageKey.CUSTOM_SUBQUERY_ENDPOINT, '');
      setIsSubqueryEndpointValid(false);

      return;
    }

    localStorage.setItem(
      LocalStorageKey.CUSTOM_SUBQUERY_ENDPOINT,
      subqueryEndpoint
    );

    setSavedEndpoints({
      ...savedEndpoints,
      subqueryEndpoint: subqueryEndpoint,
    });

    setIsSubqueryEndpointValid(true);
  };

  const handleDeletePolkadotEndpoint = () => {
    setDefaultEndpointsAsUserSelected();
    localStorage.removeItem(LocalStorageKey.CUSTOM_POLKADOT_ENDPOINT);

    setSavedEndpoints({
      ...savedEndpoints,
      polkadotEndpoint: '',
    });

    setPolkadotEndpoint('');
  };

  const handleSavePolkadotEndpoint = async () => {
    if (!(await isValidPolkadotEndpoint(polkadotEndpoint))) {
      localStorage.setItem(LocalStorageKey.CUSTOM_POLKADOT_ENDPOINT, '');
      setIsPolkadotEndpointValid(false);

      return;
    }

    localStorage.setItem(
      LocalStorageKey.CUSTOM_POLKADOT_ENDPOINT,
      polkadotEndpoint
    );

    setSavedEndpoints({
      ...savedEndpoints,
      polkadotEndpoint: polkadotEndpoint,
    });

    setIsPolkadotEndpointValid(true);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <RadioItem id="custom-network" value="Custom Network">
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

        {selectedNetworkType !== 'dev' && <TangleIcon size="lg" />}
      </div>

      <div className="flex flex-col space-y-2.5">
        <EndpointInput
          id="subquery-endpoint"
          placeholder="Subquery endpoint"
          isValid={isSubqueryEndpointValid}
          value={subqueryEndpoint}
          isSaved={savedEndpoints.subqueryEndpoint !== ''}
          setValue={setSubqueryEndpoint}
          setIsValid={setIsSubqueryEndpointValid}
          handleDelete={handleDeleteSubqueryEndpoint}
          handleSave={handleSaveSubqueryEndpoint}
        />

        <EndpointInput
          id="polkadot-endpoint"
          placeholder="Polkadot endpoint"
          isValid={isPolkadotEndpointValid}
          value={polkadotEndpoint}
          isSaved={savedEndpoints.polkadotEndpoint !== ''}
          setValue={setPolkadotEndpoint}
          setIsValid={setIsPolkadotEndpointValid}
          handleDelete={handleDeletePolkadotEndpoint}
          handleSave={handleSavePolkadotEndpoint}
        />
      </div>
    </>
  );
};

export default DevNetworkConfig;
