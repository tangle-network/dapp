import { Save, SaveWithBg } from '@webb-tools/icons';
import { Input } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useEffect, useState } from 'react';

import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';

export type CustomRpcEndpointInputProps = {
  id: string;
  placeholder: string;
  setCustomNetwork: (customRpcEndpoint: string) => void;
};

const CustomRpcEndpointInput: FC<CustomRpcEndpointInputProps> = ({
  id,
  placeholder,
  setCustomNetwork,
}) => {
  const { get: getCachedCustomRpcEndpoint } = useLocalStorage(
    LocalStorageKey.CUSTOM_RPC_ENDPOINT
  );

  const [value, setValue] = useState('');

  const handleSave = useCallback(
    () => setCustomNetwork(value),
    [value, setCustomNetwork]
  );

  // On mount, load the cached custom RPC endpoint. If it
  // exists, set it as the initial value of the input.
  useEffect(() => {
    const cachedCustomRpcEndpoint = getCachedCustomRpcEndpoint();

    if (cachedCustomRpcEndpoint !== null) {
      setValue(cachedCustomRpcEndpoint);
    }
  }, [getCachedCustomRpcEndpoint]);

  return (
    <Input
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={setValue}
      rightIcon={
        value !== '' ? (
          <SaveWithBg className="cursor-pointer" onClick={handleSave} />
        ) : (
          <Save className="opacity-60 cursor-not-allowed" />
        )
      }
    />
  );
};

export default CustomRpcEndpointInput;
