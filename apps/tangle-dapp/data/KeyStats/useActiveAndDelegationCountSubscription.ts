'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { getPolkadotApiPromise } from '../../utils/polkadot';
import useCurrentEra from '../staking/useCurrentEra';

export default function useActiveAndDelegationCountSubscription(
  defaultValue: { value1: number | null; value2: number | null } = {
    value1: null,
    value2: null,
  }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [value1, setValue1] = useState(defaultValue.value1);
  const [value2, setValue2] = useState(defaultValue.value2);
  const { rpcEndpoint } = useNetworkStore();
  const { data: currentEra } = useCurrentEra();

  const { get: getCachedValue, set: setCache } = useLocalStorage(
    LocalStorageKey.ACTIVE_AND_DELEGATION_COUNT,
    true
  );

  useEffect(() => {
    const cachedValue = getCachedValue();

    if (cachedValue !== null) {
      setValue1(cachedValue.value1);
      setValue2(cachedValue.value2);
      setIsLoading(false);
    }
  }, [getCachedValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentEra) {
          setIsLoading(false);
          return;
        }

        const apiPromise = await getPolkadotApiPromise(rpcEndpoint);

        const validators = await apiPromise.query.staking.validators.entries();
        const validatorAddress = validators.map(([key, _]) => {
          return key.args[0].toString();
        });
        const counterForNominators =
          await apiPromise.query.staking.counterForNominators();

        const nominatorSet = new Set<string>();

        const promises = Promise.all(
          validatorAddress.map(async (address) => {
            const eraStakerPaged =
              await apiPromise.query.staking.erasStakersPaged(
                currentEra,
                address,
                0
              );

            if (eraStakerPaged.isNone) {
              return;
            }

            const eraStakerExposure = eraStakerPaged.unwrap();

            eraStakerExposure.others.forEach((exposure) => {
              nominatorSet.add(exposure.who.toString());
            });
          })
        );

        await promises;

        const newValue1 = nominatorSet.size;
        const newValue2 = counterForNominators.toNumber();

        if (newValue1 !== value1 || newValue2 !== value2) {
          setValue1(newValue1);
          setValue2(newValue2);
          setCache({ value1: newValue1, value2: newValue2 });
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
        setError(
          error instanceof Error
            ? error
            : WebbError.from(WebbErrorCodes.UnknownError)
        );
      }
    };

    fetchData();
  }, [currentEra, rpcEndpoint, setCache, value1, value2]);

  return useFormatReturnType({ isLoading, error, data: { value1, value2 } });
}
