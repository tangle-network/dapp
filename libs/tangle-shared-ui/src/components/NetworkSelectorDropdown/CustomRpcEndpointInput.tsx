import { Save, SaveWithBg } from '@tangle-network/icons';
import { Input } from '@tangle-network/ui-components';
import { FC, useCallback, useState } from 'react';
import {
  getJsonFromLocalStorage,
  LocalStorageKey,
} from '../../hooks/useLocalStorage';

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
  const [value, setValue] = useState(() => {
    if (typeof localStorage === 'undefined') {
      return '';
    }

    return getJsonFromLocalStorage(LocalStorageKey.CUSTOM_RPC_ENDPOINT) ?? '';
  });

  const handleSave = useCallback(
    () => setCustomNetwork(value),
    [value, setCustomNetwork],
  );

  const rightIcon =
    value !== '' ? (
      <SaveWithBg className="cursor-pointer" onClick={handleSave} />
    ) : (
      <Save className="cursor-not-allowed opacity-60" />
    );

  return (
    <Input
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={setValue}
      isControlled
      rightIcon={rightIcon}
    />
  );
};

export default CustomRpcEndpointInput;
