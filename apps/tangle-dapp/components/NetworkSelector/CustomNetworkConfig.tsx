import { TangleIcon } from '@webb-tools/icons';
import { RadioItem } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { InfoIconWithTooltip } from '../InfoIconWithTooltip';
import EndpointInput from './EndpointInput';

export type CustomNetworkConfigProps = {
  setCustomNetwork: () => void;
};

const CustomNetworkConfig: FC<CustomNetworkConfigProps> = ({
  setCustomNetwork,
}) => {
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

        <TangleIcon size="lg" />
      </div>

      <div className="flex flex-col space-y-2.5">
        <EndpointInput
          id="custom-rpc-endpoint"
          placeholder="RPC endpoint URL"
          setCustomNetwork={setCustomNetwork}
        />
      </div>
    </>
  );
};

export default CustomNetworkConfig;
