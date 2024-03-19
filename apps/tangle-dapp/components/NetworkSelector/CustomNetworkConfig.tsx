import { TangleIcon } from '@webb-tools/icons';
import { RadioItem } from '@webb-tools/webb-ui-components';
import { NetworkType } from '@webb-tools/webb-ui-components/constants';
import { FC, useState } from 'react';

import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { InfoIconWithTooltip } from '../InfoIconWithTooltip';
import EndpointInput from './EndpointInput';

export type CustomNetworkConfigProps = {
  selectedNetworkType: NetworkType;
};

const CustomNetworkConfig: FC<CustomNetworkConfigProps> = ({
  selectedNetworkType,
}) => {
  const { value: cachedRpcEndpoint } = useLocalStorage(
    LocalStorageKey.CUSTOM_RPC_ENDPOINT
  );

  const [savedEndpoints, setSavedEndpoints] = useState({
    // Use the cached values from local storage, if available.
    // Otherwise, default to an empty string.
    polkadotEndpoint: cachedRpcEndpoint ?? '',
  });

  const [polkadotEndpoint, setRpcEndpoint] = useState(
    savedEndpoints.polkadotEndpoint ?? ''
  );

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
          id="custom-rpc-endpoint"
          placeholder="RPC endpoint URL"
          value={polkadotEndpoint}
          isSaved={savedEndpoints.polkadotEndpoint !== ''}
          setValue={setRpcEndpoint}
        />
      </div>
    </>
  );
};

export default CustomNetworkConfig;
