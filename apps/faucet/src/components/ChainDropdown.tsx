'use client';

import { RadioGroup, RadioItem } from '@radix-ui/react-dropdown-menu';
import { ChainIcon } from '@webb-tools/icons';
import {
  ChainInput,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  MenuItem,
} from '@webb-tools/webb-ui-components';
import { FC, useMemo, useState } from 'react';

const ChainDropdown: FC<{
  chainNames: Array<string>;
}> = ({ chainNames }) => {
  // State to hold the selected chain
  const [chain, setChain] = useState<string | undefined>();

  const chainInputVal = useMemo(
    () => (chain ? { name: chain } : undefined),
    [chain]
  );

  return (
    <Dropdown className="block grow shrink basis-0">
      <DropdownBasicButton isFullWidth>
        <ChainInput chain={chainInputVal} title="Network" chainType="source" />
      </DropdownBasicButton>

      <DropdownBody className="mt-3 w-[277px]">
        <RadioGroup value={chain} onValueChange={(val) => setChain(val)}>
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
