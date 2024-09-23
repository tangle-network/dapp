import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { ChainIcon } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBody,
  DropdownMenuItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC } from 'react';

import { IS_PRODUCTION_ENV } from '../../../constants/env';
import { LS_NETWORKS } from '../../../constants/liquidStaking/constants';
import { LsNetworkId } from '../../../constants/liquidStaking/types';
import { NETWORK_FEATURE_MAP } from '../../../constants/networks';
import { NetworkFeature } from '../../../types';
import getLsNetwork from '../../../utils/liquidStaking/getLsNetwork';
import getLsTangleNetwork from '../../../utils/liquidStaking/getLsTangleNetwork';
import DropdownChevronIcon from './DropdownChevronIcon';

type NetworkSelectorProps = {
  selectedNetworkId: LsNetworkId;

  /**
   * If this function is not provided, the selector will be
   * considered read-only.
   */
  setNetworkId?: (newNetworkId: LsNetworkId) => void;
};

const NetworkSelector: FC<NetworkSelectorProps> = ({
  selectedNetworkId,
  setNetworkId,
}) => {
  const isReadOnly = setNetworkId === undefined;
  const selectedNetwork = getLsNetwork(selectedNetworkId);

  const base = (
    <div className="group flex gap-1 items-center justify-center">
      <div className="flex gap-2 items-center justify-center">
        <ChainIcon size="lg" name={selectedNetwork.chainIconFileName} />

        <Typography variant="h5" fw="bold" className="dark:text-mono-40">
          {selectedNetwork.networkName}
        </Typography>
      </div>

      {!isReadOnly && <DropdownChevronIcon isLarge />}
    </div>
  );

  // Filter out networks that don't support liquid staking yet.
  const supportedLsNetworks = LS_NETWORKS.filter((network) => {
    if (network.id === LsNetworkId.ETHEREUM_MAINNET_LIQUIFIER) {
      return true;
    }
    // Exclude the local Tangle network in production.
    else if (network.id === LsNetworkId.TANGLE_LOCAL && IS_PRODUCTION_ENV) {
      return false;
    }

    // TODO: Obtain the Tangle network from the LS Network's properties instead.
    const tangleNetwork = getLsTangleNetwork(network.id);

    assert(tangleNetwork !== null);

    return NETWORK_FEATURE_MAP[tangleNetwork.id].includes(
      NetworkFeature.LsPools,
    );
  });

  return setNetworkId !== undefined ? (
    <Dropdown>
      <DropdownMenuTrigger>{base}</DropdownMenuTrigger>

      <DropdownBody>
        <ScrollArea>
          <ul className="max-h-[300px]">
            {supportedLsNetworks.map((network) => {
              return (
                <li key={network.id}>
                  <DropdownMenuItem onClick={() => setNetworkId(network.id)}>
                    <div className="flex gap-2 items-center justify-start">
                      <ChainIcon size="lg" name={network.chainIconFileName} />

                      <Typography
                        variant="h5"
                        fw="bold"
                        className="dark:text-mono-40"
                      >
                        {network.networkName}
                      </Typography>
                    </div>
                  </DropdownMenuItem>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </DropdownBody>
    </Dropdown>
  ) : (
    base
  );
};

export default NetworkSelector;
