import { Transition } from '@headlessui/react';
import { isEthereumAddress } from '@polkadot/util-crypto';
import isSubstrateAddress from '@webb-tools/dapp-types/utils/isSubstrateAddress';
import isValidAddress from '@webb-tools/dapp-types/utils/isValidAddress';
import { RecipientInput } from '@webb-tools/webb-ui-components/components/BridgeInputs/RecipientInput';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import { useObservableState } from 'observable-hooks';
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { map } from 'rxjs';

import { useFaucetContext } from '../provider';
import useStore, { StoreKey } from '../store';
import type { AddressType } from '../types';
import isAllowSubstrateAddress from '../utils/isAllowSubstrateAddress';

const RecipientAddressInput = () => {
  const { inputValues$ } = useFaucetContext();

  const [getStore] = useStore();

  const [error, setError] = useState('');

  const recipientAddress = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.recepient))
  );

  const typedChainId = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.chain))
  );

  const tokenAddress = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.contractAddress))
  );

  const twitterHandle = useMemo(() => {
    return getStore(StoreKey.twitterHandle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStore(StoreKey.twitterHandle)]);

  const inputProps = useMemo(() => {
    const placeholder = getInputPlaceholder(typedChainId, tokenAddress);

    return {
      isDisabled: !twitterHandle,
      placeholder,
    } satisfies ComponentProps<typeof RecipientInput>['overrideInputProps'];
  }, [tokenAddress, twitterHandle, typedChainId]);

  const updateRecipientAddress = useCallback(
    (address: string) => {
      const isValidAddr = validateAddress(address, typedChainId, tokenAddress);

      // Only show error when user has typed something
      if (address && !isValidAddr) {
        setError(getErrorMessage(typedChainId, tokenAddress));
      } else {
        setError('');
      }

      const addrType = getAddressType(address);

      const inputValues = inputValues$.getValue();
      inputValues$.next({
        ...inputValues,
        isValidRecipientAddress: isValidAddr,
        recepient: address,
        recepientAddressType: addrType,
      });
    },
    [inputValues$, tokenAddress, typedChainId]
  );

  useEffect(() => {
    if (!twitterHandle) {
      updateRecipientAddress('');
    }
  }, [twitterHandle, updateRecipientAddress]);

  return (
    <div>
      <RecipientInput
        className={cx(
          '!max-w-none input-height border',
          'transition-[border-color] duration-150',
          error ? 'border-red-70 dark:border-red-50' : 'border-transparent'
        )}
        title="Address"
        value={recipientAddress}
        onChange={updateRecipientAddress}
        overrideInputProps={inputProps}
      />

      {/** Set min height to prevent UI shift when error message appears */}
      <div className="min-h-[24px]">
        <Transition
          show={Boolean(error)}
          enter="transition-opacity duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Typography
            component="span"
            variant="mkt-small-caps"
            className="block !normal-case text-red-70 dark:text-red-50"
          >
            {error}
          </Typography>
        </Transition>
      </div>
    </div>
  );
};

export default RecipientAddressInput;

const getInputPlaceholder = (typedChainId?: number, tokenAddress?: string) => {
  if (typeof typedChainId !== 'number') {
    return 'Enter wallet address';
  }

  if (isAllowSubstrateAddress(typedChainId, tokenAddress)) {
    return 'Enter EVM or Substrate wallet address';
  }

  return 'Enter EVM wallet address';
};

const getErrorMessage = (typedChainId?: number, tokenAddress?: string) => {
  const suffix =
    typeof typedChainId === 'number'
      ? isAllowSubstrateAddress(typedChainId, tokenAddress)
        ? 'EVM or Substrate'
        : 'EVM'
      : '';

  return `*Invalid input: Please use a valid ${`${suffix} wallet address.`.trim()}`;
};

const validateAddress = (
  address: string,
  typedChainId?: number,
  tokenAddress?: string
) => {
  if (!address) {
    return false;
  }

  if (
    typeof typedChainId !== 'number' ||
    isAllowSubstrateAddress(typedChainId, tokenAddress)
  ) {
    return isValidAddress(address);
  }

  return isEthereumAddress(address);
};

const getAddressType = (address: string): AddressType | undefined => {
  if (!address) {
    return;
  }

  if (isEthereumAddress(address)) {
    return 'ethereum';
  }

  if (isSubstrateAddress(address)) {
    return 'substrate';
  }
};
