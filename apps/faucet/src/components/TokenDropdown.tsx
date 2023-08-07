import { RadioGroup, RadioItem } from '@radix-ui/react-dropdown-menu';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
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

import constants from '../config/shared';
import { useFaucetContext } from '../provider';

const TokenDropdown = () => {
  const { config, inputValues$, amount$ } = useFaucetContext();

  const token = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.token))
  );

  const setToken = useCallback(
    (token: string | undefined, contractAddress?: string) => {
      const currentVal = inputValues$.getValue();

      // If the contract address is 0, then we are using the native token
      if (contractAddress && BigInt(contractAddress) === ZERO_BIG_INT) {
        amount$.next(constants.nativeAmount);
      } else if (contractAddress) {
        amount$.next(constants.amount);
      }

      inputValues$.next({
        ...currentVal,
        contractAddress,
        token,
      });
    },
    [amount$, inputValues$]
  );

  const selectedChain = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.chain))
  );

  const currentChainData = useMemo(() => {
    if (!selectedChain) return undefined;

    return config[selectedChain];
  }, [config, selectedChain]);

  const tokenNames = useMemo(() => {
    if (!selectedChain || !currentChainData) {
      return [];
    }

    return Object.keys(currentChainData.tokenAddresses);
  }, [currentChainData, selectedChain]);

  const tokenInputVal = useMemo(
    () => (token ? { symbol: token } : undefined),
    [token]
  );

  const handleValueChange = React.useCallback(
    (val: string) => {
      setToken(val, currentChainData?.tokenAddresses[val]);
    },
    [currentChainData?.tokenAddresses, setToken]
  );

  // Effect to reset the token value when the chain changes
  useEffect(() => {
    if (tokenNames.length > 0 && currentChainData) {
      const defaultToken = tokenNames[0];
      setToken(defaultToken, currentChainData.tokenAddresses[defaultToken]);
    }
  }, [currentChainData, setToken, tokenNames]);

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
