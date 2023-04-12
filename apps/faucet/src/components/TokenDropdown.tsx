import { RadioGroup, RadioItem } from '@radix-ui/react-dropdown-menu';
import { TokenIcon } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  MenuItem,
  TokenInput,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { useObservableState } from 'observable-hooks';
import React, { useCallback, useEffect, useMemo } from 'react';
import { map } from 'rxjs';

import { useFaucetContext } from '../provider';

const TokenDropdown = () => {
  const { config, inputValues$ } = useFaucetContext();

  const token = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.token))
  );

  const setToken = useCallback(
    (token: string | undefined) => {
      const currentVal = inputValues$.getValue();
      inputValues$.next({
        ...currentVal,
        token,
      });
    },
    [inputValues$]
  );

  const selectedChain = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.chain))
  );

  const tokenNames = useMemo(() => {
    if (!selectedChain || !config[selectedChain]?.tokenAddresses) {
      return [];
    }

    return Object.keys(config[selectedChain].tokenAddresses);
  }, [config, selectedChain]);

  const tokenInputVal = useMemo(
    () => (token ? { symbol: token } : undefined),
    [token]
  );

  const handleValueChange = React.useCallback(
    (val: string) => {
      setToken(val);
    },
    [setToken]
  );

  // Effect to reset the token value when the chain changes
  useEffect(() => {
    if (tokenNames.length > 0) {
      setToken(tokenNames[0]);
    }
  }, [setToken, tokenNames]);

  return (
    <Dropdown className="block grow shrink basis-0">
      <DropdownBasicButton
        disabled={tokenNames.length === 0}
        className="h-full group focus-visible:outline-none"
        isFullWidth
      >
        <TokenInput className="h-full" token={tokenInputVal} />
      </DropdownBasicButton>

      <DropdownBody
        className={cx('radix-side-bottom:mt-3 radix-side-top:mb-3 w-[277px]', {
          hidden: !tokenNames.length,
        })}
      >
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
