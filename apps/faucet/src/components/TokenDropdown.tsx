import { RadioGroup, RadioItem } from '@radix-ui/react-dropdown-menu';
import { TokenIcon } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  MenuItem,
  TokenInput,
} from '@webb-tools/webb-ui-components';
import { useObservableState } from 'observable-hooks';
import React, { useEffect, useMemo } from 'react';
import { map } from 'rxjs';

import { useFaucetContext } from '../provider';

const TokenDropdown = () => {
  // State to hold the selected token
  const [token, setToken] = React.useState<string | undefined>();

  const { config, inputValues$ } = useFaucetContext();

  const selectedChain = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.chain))
  );

  const tokenNames = useMemo(() => {
    if (!selectedChain || !config[selectedChain]) {
      return [];
    }
    const names = Object.keys(config[selectedChain]);
    // Set the first token as default
    if (names.length > 0) {
      setToken(names[0]);
    }

    return names;
  }, [config, selectedChain]);

  const tokenInputVal = useMemo(
    () => (token ? { symbol: token } : undefined),
    [token]
  );

  const handleValueChange = React.useCallback(
    (val: string) => {
      setToken(val);
      const currentVal = inputValues$.getValue();
      inputValues$.next({ ...currentVal, token: val });
    },
    [inputValues$]
  );

  return (
    <Dropdown className="block grow shrink basis-0">
      <DropdownBasicButton
        className="group focus-visible:outline-none"
        isFullWidth
      >
        <TokenInput token={tokenInputVal} />
      </DropdownBasicButton>

      <DropdownBody className="radix-side-bottom:mt-3 radix-side-top:mb-3 w-[277px]">
        <RadioGroup value={token} onValueChange={handleValueChange}>
          {tokenNames.map((tokenName, i) => (
            <RadioItem key={`${tokenName}-${i}`} value={tokenName} asChild>
              <MenuItem
                textTransform="normal-case"
                startIcon={<TokenIcon size="lg" name={tokenName} />}
              >
                {tokenName}
              </MenuItem>
            </RadioItem>
          ))}
        </RadioGroup>
      </DropdownBody>
    </Dropdown>
  );
};

export default TokenDropdown;
