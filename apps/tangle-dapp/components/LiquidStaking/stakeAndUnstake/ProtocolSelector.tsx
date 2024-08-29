import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { ChainIcon } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBody,
  DropdownMenuItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { FC } from 'react';

import { LS_DERIVATIVE_TOKEN_PREFIX } from '../../../constants/liquidStaking/constants';
import {
  LsNetworkId,
  LsProtocolId,
} from '../../../constants/liquidStaking/types';
import getLsNetwork from '../../../utils/liquidStaking/getLsNetwork';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import LsTokenIcon from '../../LsTokenIcon';
import DropdownChevronIcon from './DropdownChevronIcon';

type ProtocolSelectorProps = {
  selectedNetworkId: LsNetworkId;
  selectedProtocolId: LsProtocolId;
  setProtocolId?: (newProtocolId: LsProtocolId) => void;
  isDerivativeVariant: boolean;
};

const ProtocolSelector: FC<ProtocolSelectorProps> = ({
  selectedNetworkId,
  selectedProtocolId,
  setProtocolId,
  isDerivativeVariant,
}) => {
  const protocol = getLsProtocolDef(selectedProtocolId);
  const network = getLsNetwork(selectedNetworkId);

  const trySetProtocolId = (newProtocolId: LsProtocolId) => {
    return () => {
      if (setProtocolId === undefined) {
        return;
      }

      setProtocolId(newProtocolId);
    };
  };

  return (
    <Dropdown>
      <DropdownMenuTrigger disabled={setProtocolId === undefined}>
        <div className="group flex gap-2 justify-center items-center bg-mono-40 dark:bg-mono-170 px-4 py-2 rounded-lg">
          <LsTokenIcon name={protocol.token} />

          <Typography variant="h5" fw="bold">
            {isDerivativeVariant && LS_DERIVATIVE_TOKEN_PREFIX}
            {protocol.token}
          </Typography>

          {setProtocolId !== undefined && <DropdownChevronIcon isLarge />}
        </div>
      </DropdownMenuTrigger>

      <DropdownBody>
        <ScrollArea>
          <ul className="max-h-[300px]">
            {network.protocols.map((protocol) => {
              return (
                <li key={protocol.id}>
                  <DropdownMenuItem onClick={trySetProtocolId(protocol.id)}>
                    <div className="flex gap-2 items-center justify-start">
                      <ChainIcon size="lg" name={protocol.chainIconFileName} />

                      <Typography
                        variant="h5"
                        fw="bold"
                        className="dark:text-mono-40"
                      >
                        {protocol.name}
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
  );
};

export default ProtocolSelector;
