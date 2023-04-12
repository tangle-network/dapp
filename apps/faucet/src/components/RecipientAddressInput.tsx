import { isEthereumAddress } from '@polkadot/util-crypto';
import isValidAddress from '@webb-tools/dapp-types/utils/isValidAddress';
import { RecipientInput } from '@webb-tools/webb-ui-components';
import { useObservableState } from 'observable-hooks';
import { ComponentProps, useCallback, useEffect, useMemo } from 'react';
import { map } from 'rxjs';

import { useFaucetContext } from '../provider';
import useStore, { StoreKey } from '../store';

const overrideInputProps: ComponentProps<
  typeof RecipientInput
>['overrideInputProps'] = {
  placeholder: '0x000000000000000000000000000000',
};

const RecipientAddressInput = () => {
  const { inputValues$ } = useFaucetContext();

  const [getStore] = useStore();

  const recipientAddress = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.recepient))
  );

  const twitterHandle = useMemo(() => {
    return getStore(StoreKey.twitterHandle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStore(StoreKey.twitterHandle)]);

  const inputProps = useMemo(
    () => ({
      ...overrideInputProps,
      isDisabled: !twitterHandle,
    }),
    [twitterHandle]
  );

  const updateRecipientAddress = useCallback(
    (address: string) => {
      const addrType = isEthereumAddress(address) ? 'ethereum' : 'substrate';

      const inputValues = inputValues$.getValue();
      inputValues$.next({
        ...inputValues,
        recepient: address,
        recepientAddressType: addrType,
      });
    },
    [inputValues$]
  );

  useEffect(() => {
    if (!twitterHandle) {
      updateRecipientAddress('');
    }
  }, [twitterHandle, updateRecipientAddress]);

  return (
    <div className="space-y-2">
      <RecipientInput
        className="max-w-none input-height"
        title="Address"
        value={recipientAddress}
        onChange={updateRecipientAddress}
        overrideInputProps={inputProps}
        validate={isValidAddress}
      />
    </div>
  );
};

export default RecipientAddressInput;
