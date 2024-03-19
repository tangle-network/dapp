import { DeleteBinWithBg, Save, SaveWithBg } from '@webb-tools/icons';
import { Input } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useState } from 'react';

import useRpcEndpointStore from '../../context/useRpcEndpointStore';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import isValidPolkadotEndpoint from './isValidPolkadotEndpoint';

export type EndpointInputProps = {
  id: string;
  placeholder: string;
  setCustomNetwork: () => void;
};

const EndpointInput: FC<EndpointInputProps> = ({
  id,
  placeholder,
  setCustomNetwork,
}) => {
  const { rpcEndpoint } = useRpcEndpointStore();
  const [value, setValue] = useState(rpcEndpoint);
  const [isValid, setIsValid] = useState(true);
  const { setRpcEndpoint: setActiveRpcEndpoint } = useRpcEndpointStore();
  const [rpcEndpointInput, setRpcEndpointInput] = useState('');

  const {
    remove: removeCachedRpcEndpoint,
    set: setCachedRpcEndpoint,
    isSet: isCached,
  } = useLocalStorage(LocalStorageKey.CUSTOM_RPC_ENDPOINT);

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
    setCustomNetwork();
    removeCachedRpcEndpoint();
    setRpcEndpointInput('');
  }, [removeCachedRpcEndpoint, setCustomNetwork]);

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
        isCached ? (
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
