import { Save, SaveWithBg } from '@webb-tools/icons';
import { Input } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useState } from 'react';

import useRpcEndpointStore from '../../context/useRpcEndpointStore';

export type EndpointInputProps = {
  id: string;
  placeholder: string;
  setCustomNetwork: (customRpcEndpoint: string) => void;
};

const EndpointInput: FC<EndpointInputProps> = ({
  id,
  placeholder,
  setCustomNetwork,
}) => {
  const { rpcEndpoint } = useRpcEndpointStore();
  const [value, setValue] = useState(rpcEndpoint);

  const handleSave = useCallback(() => {
    setCustomNetwork(value);
  }, [value, setCustomNetwork]);

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

export default EndpointInput;
