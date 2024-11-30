import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { ChainIcon } from '@webb-tools/icons';
import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import {
  Dropdown,
  DropdownBody,
  DropdownMenuItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { FC, useCallback } from 'react';

import { LS_DERIVATIVE_TOKEN_PREFIX } from '../../../constants/liquidStaking/constants';
import { LsNetworkId } from '../../../constants/liquidStaking/types';
import getLsNetwork from '../../../utils/liquidStaking/getLsNetwork';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import DropdownChevronIcon from '../../DropdownChevronIcon';
import LsTokenIcon from '../LsTokenIcon';

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

  const trySetProtocolId = useCallback(
    (newProtocolId: LsProtocolId) => {
      return () => {
        if (setProtocolId === undefined) {
          return;
        }

        setProtocolId(newProtocolId);
      };
    },
    [setProtocolId],
  );

  return (
    <Dropdown>
      <DropdownMenuTrigger
        disabled={setProtocolId === undefined || network.protocols.length === 1}
      >
        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg group bg-mono-40 dark:bg-mono-170">
          <LsTokenIcon name={protocol.token} />

          <Typography variant="h5" fw="bold">
            {isDerivativeVariant && LS_DERIVATIVE_TOKEN_PREFIX}
            {protocol.token}
          </Typography>

          {setProtocolId !== undefined && network.protocols.length > 1 && (
            <DropdownChevronIcon isLarge />
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownBody>
        <ScrollArea>
          <ul className="max-h-[300px]">
            {network.protocols.map((protocol) => {
              return (
                <li key={protocol.id}>
                  <DropdownMenuItem onClick={trySetProtocolId(protocol.id)}>
                    <div className="flex items-center justify-start gap-2">
                      <ChainIcon size="lg" name={protocol.chainIconFileName} />

                      <Typography
                        variant="h5"
                        fw="bold"
                        className="dark:text-mono-40"
                      >
                        {protocol.token}
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
