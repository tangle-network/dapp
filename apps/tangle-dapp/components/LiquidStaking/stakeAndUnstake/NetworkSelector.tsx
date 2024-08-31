import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { ChainIcon } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBody,
  DropdownMenuItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { LS_NETWORKS } from '../../../constants/liquidStaking/constants';
import { LsNetworkId } from '../../../constants/liquidStaking/types';
import getLsNetwork from '../../../utils/liquidStaking/getLsNetwork';
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

  return setNetworkId !== undefined ? (
    <Dropdown>
      <DropdownMenuTrigger>{base}</DropdownMenuTrigger>

      <DropdownBody>
        <ScrollArea>
          <ul className="max-h-[300px]">
            {LS_NETWORKS.map((network) => {
              return (
                <li key={network.type}>
                  <DropdownMenuItem onClick={() => setNetworkId(network.type)}>
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
