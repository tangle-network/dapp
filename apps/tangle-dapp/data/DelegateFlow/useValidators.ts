'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';

import { getPolkadotApiPromise, getValidatorIdentity } from '../../constants';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import { ValidatorType } from '../../types';

export default function useValidators(
  defaultValue: { validators: ValidatorType[] } = {
    validators: [],
  }
) {
  const [validators, setValidators] = useState(defaultValue.validators);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = await getPolkadotApiPromise();
        if (!api) {
          throw WebbError.from(WebbErrorCodes.ApiNotReady);
        }

        const validators = await api.query.session.validators();

        const validatorsList = await Promise.all(
          validators.map(async (validator) => {
            const identity = await getValidatorIdentity(validator.toString());
            return {
              address: validator.toString(),
              identity: identity ?? '',
            };
          })
        );

        setValidators(validatorsList);
        setIsLoading(false);
      } catch (e) {
        setError(
          e instanceof Error ? e : WebbError.from(WebbErrorCodes.UnknownError)
        );
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return useFormatReturnType({
    isLoading,
    error,
    data: { validators },
  });
}
