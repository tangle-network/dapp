import { DeleteBinWithBg, Save, SaveWithBg } from '@webb-tools/icons';
import { Input } from '@webb-tools/webb-ui-components';
import { webbNetworks } from '@webb-tools/webb-ui-components/constants';
import assert from 'assert';
import { FC, useCallback, useState } from 'react';

import useRpcEndpointStore from '../../context/useRpcEndpointStore';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import isValidPolkadotEndpoint from './isValidPolkadotEndpoint';

export type EndpointInputProps = {
  id: string;
  placeholder: string;
  value?: string;
  isSaved: boolean;
  setValue: (newValue: string) => void;
};

const EndpointInput: FC<EndpointInputProps> = ({
  id,
  placeholder,
  value,
  isSaved,
  setValue,
}) => {
  const [isValid, setIsValid] = useState(true);
  const { setRpcEndpoint: setActiveRpcEndpoint } = useRpcEndpointStore();
  const [rpcEndpointInput, setRpcEndpointInput] = useState('');

  const { remove: removeCachedRpcEndpoint, set: setCachedRpcEndpoint } =
    useLocalStorage(LocalStorageKey.CUSTOM_RPC_ENDPOINT);

  const setDefaultEndpointsAsUserSelected = () => {
    if (
      selectedNetwork.name !== 'Custom Network' ||
      localStorage.getItem(LocalStorageKey.CUSTOM_RPC_ENDPOINT) === null
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

  const handleSave = useCallback(async () => {
    if (!(await isValidPolkadotEndpoint(rpcEndpointInput))) {
      setIsValid(false);

      return;
    }

    setCachedRpcEndpoint(rpcEndpointInput);
    setActiveRpcEndpoint(rpcEndpointInput);
    setIsValid(true);
  }, [rpcEndpointInput, setActiveRpcEndpoint, setCachedRpcEndpoint]);

  const handleDelete = useCallback(() => {
    setDefaultEndpointsAsUserSelected();
    removeCachedRpcEndpoint();
    setRpcEndpointInput('');
  }, [removeCachedRpcEndpoint]);

  return (
    <Input
      id={id}
      placeholder={placeholder}
      errorMessage={!isValid ? 'Invalid endpoint' : ''}
      isInvalid={!isValid}
      value={value}
      onChange={setValue}
      // Disable validation when the user focuses on the input
      // to give them a chance to correct the value.
      onFocus={() => setIsValid(true)}
      rightIcon={
        isSaved ? (
          <DeleteBinWithBg className="cursor-pointer" onClick={handleDelete} />
        ) : value !== undefined ? (
          <SaveWithBg className="cursor-pointer" onClick={handleSave} />
        ) : (
          <Save className="pointer-events-none opacity-60 cursor-not-allowed" />
        )
      }
    />
  );
};

export default EndpointInput;
