import { RecipientInput } from '@webb-tools/webb-ui-components';
import { useObservableState } from 'observable-hooks';
import React, { ComponentProps, useCallback, useEffect, useMemo } from 'react';
import { map } from 'rxjs';

import { useFaucetContext } from '../provider';

const overrideInputProps: ComponentProps<
  typeof RecipientInput
>['overrideInputProps'] = {
  placeholder: '0x000000000000000000000000000000',
};

const RecipientAddressInput = () => {
  const { inputValues$, twitterHandle$ } = useFaucetContext();

  const recipientAddress = useObservableState(
    inputValues$.pipe(map((inputValues) => inputValues.recepient))
  );

  const twitterHandle = useObservableState(twitterHandle$);

  const inputProps = useMemo(
    () => ({
      ...overrideInputProps,
      isDisabled: !twitterHandle,
    }),
    [twitterHandle]
  );

  const updateRecipientAddress = useCallback(
    (address: string) => {
      const inputValues = inputValues$.getValue();
      inputValues$.next({
        ...inputValues,
        recepient: address,
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
      />
    </div>
  );
};

export default RecipientAddressInput;
