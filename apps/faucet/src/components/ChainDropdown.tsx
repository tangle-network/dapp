import { RadioGroup, RadioItem } from '@radix-ui/react-dropdown-menu';
import { ChainIcon } from '@webb-tools/icons';
import {
  ChainInput,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  MenuItem,
} from '@webb-tools/webb-ui-components';
import { useObservableState } from 'observable-hooks';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { useFaucetContext } from '../provider';

const ChainDropdown: FC<{
  chainNames: Array<string>;
}> = ({ chainNames }) => {
  // State to hold the selected chain
  const [chain, setChain] = useState<string | undefined>();

  const { inputValues$ } = useFaucetContext();

  const chainInputVal = useMemo(
    () => (chain ? { name: chain } : undefined),
    [chain]
  );

  const handleValueChange = useCallback(
    (val: string) => {
      setChain(val);
      const currentVal = inputValues$.getValue();
      inputValues$.next({ ...currentVal, chain: val });
    },
    [inputValues$]
  );

  return (
    <Dropdown className="block grow shrink basis-0">
      <DropdownBasicButton
        className="group focus-visible:outline-none"
        isFullWidth
      >
        <ChainInput chain={chainInputVal} title="Network" chainType="source" />
      </DropdownBasicButton>

      <DropdownBody className="radix-side-bottom:mt-3 radix-side-top:mb-3 w-[277px]">
        <RadioGroup value={chain} onValueChange={handleValueChange}>
          {chainNames.map((chainName, i) => (
            <RadioItem key={`${chainName}-${i}`} value={chainName} asChild>
              <MenuItem startIcon={<ChainIcon size="lg" name={chainName} />}>
                {chainName}
              </MenuItem>
            </RadioItem>
          ))}
        </RadioGroup>
      </DropdownBody>
    </Dropdown>
  );
};

export default ChainDropdown;
