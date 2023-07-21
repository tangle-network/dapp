import { RadioGroup, RadioItem } from '@radix-ui/react-dropdown-menu';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { ChainIcon } from '@webb-tools/icons';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import {
  ChainInput,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  MenuItem,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';

import { useFaucetContext } from '../provider';

const ChainDropdown: FC = () => {
  // State to hold the selected chain
  const [typedChainId, setTypedChainId] = useState<number | undefined>();

  const { config, inputValues$ } = useFaucetContext();

  const chains = useMemo(
    () =>
      Object.keys(config)
        .map((c) => chainsConfig[+c])
        .filter(Boolean),
    [config]
  );

  const chainInputVal = useMemo(
    () =>
      typedChainId ? { name: chainsConfig[typedChainId].name } : undefined,
    [typedChainId]
  );

  const handleValueChange = useCallback(
    (nextTypedChainId: string) => {
      const val = +nextTypedChainId;
      setTypedChainId(+val);
      const currentVal = inputValues$.getValue();
      inputValues$.next({ ...currentVal, chain: val });
    },
    [inputValues$]
  );

  return (
    <Dropdown className="block grow shrink basis-0">
      <DropdownBasicButton
        className="h-full group focus-visible:outline-none"
        isFullWidth
      >
        <ChainInput
          className="h-full"
          chain={chainInputVal}
          title="Network"
          chainType="source"
        />
      </DropdownBasicButton>

      <DropdownBody className="radix-side-bottom:mt-3 radix-side-top:mb-3 w-[277px]">
        <RadioGroup
          value={typedChainId?.toString()}
          onValueChange={handleValueChange}
        >
          {chains.map((chain, i) => (
            <RadioItem
              key={`${chain.name}-${i}`}
              value={`${calculateTypedChainId(chain.chainType, chain.id)}`}
              asChild
            >
              <MenuItem startIcon={<ChainIcon size="lg" name={chain.name} />}>
                {chain.name}
              </MenuItem>
            </RadioItem>
          ))}
        </RadioGroup>
      </DropdownBody>
    </Dropdown>
  );
};

export default ChainDropdown;
