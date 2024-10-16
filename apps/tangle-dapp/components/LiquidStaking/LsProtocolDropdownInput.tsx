import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { ChainIcon } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBody,
  DropdownMenuItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { FC, useCallback } from 'react';

import { LS_DERIVATIVE_TOKEN_PREFIX } from '../../constants/liquidStaking/constants';
import { LsNetworkId, LsProtocolId } from '../../constants/liquidStaking/types';
import getLsNetwork from '../../utils/liquidStaking/getLsNetwork';
import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';
import InputWrapper from '../InputWrapper';
import LsTokenIcon from '../LsTokenIcon';
import DropdownChevronIcon from './stakeAndUnstake/DropdownChevronIcon';

type LsProtocolDropdownInputProps = {
  id: string;
  networkId: LsNetworkId;
  protocolId: LsProtocolId;
  setProtocolId?: (newProtocolId: LsProtocolId) => void;
  isDerivativeVariant: boolean;
};

const LsProtocolDropdownInput: FC<LsProtocolDropdownInputProps> = ({
  id,
  networkId,
  protocolId,
  setProtocolId,
  isDerivativeVariant,
}) => {
  const protocol = getLsProtocolDef(protocolId);
  const network = getLsNetwork(networkId);

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
    <InputWrapper title="Protocol" id={id}>
      <Dropdown>
        <DropdownMenuTrigger
          disabled={
            setProtocolId === undefined || network.protocols.length === 1
          }
        >
          <div className="flex gap-2 justify-center items-center rounded-lg">
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
                      <div className="flex gap-2 items-center justify-start">
                        <ChainIcon
                          size="lg"
                          name={protocol.chainIconFileName}
                        />

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
    </InputWrapper>
  );
};

export default LsProtocolDropdownInput;
