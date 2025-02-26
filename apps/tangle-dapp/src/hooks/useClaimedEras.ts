import useLocalStorage, {
  LocalStorageKey,
} from '@tangle-network/tangle-shared-ui/hooks/useLocalStorage';
import { useCallback, useEffect, useState } from 'react';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

type ClaimedErasByValidator = Record<SubstrateAddress, number[]>;

/**
 * Hook to manage claimed eras by validator address in local storage.
 *
 * @returns {ClaimedErasByValidator} claimed eras by validator address
 */
export const useClaimedEras = () => {
  const storage = useLocalStorage(LocalStorageKey.CLAIMED_ERAS_BY_VALIDATOR);
  const [claimedErasByValidator, setClaimedErasByValidator] =
    useState<ClaimedErasByValidator>({});

  useEffect(() => {
    const storedData = storage.valueOpt?.value ?? null;
    if (storedData) {
      setClaimedErasByValidator(storedData);
    }
  }, [storage.valueOpt]);

  const addClaimedEras = useCallback(
    (validatorAddress: SubstrateAddress, eras: number[]) => {
      const newClaimedEras = {
        ...claimedErasByValidator,
        [validatorAddress]: [
          ...(claimedErasByValidator[validatorAddress] || []),
          ...eras,
        ].sort((a, b) => a - b),
      };

      setClaimedErasByValidator(newClaimedEras);
      storage.set(newClaimedEras);

      return newClaimedEras;
    },
    [claimedErasByValidator, storage],
  );

  const getClaimedEras = useCallback(
    (validatorAddress: SubstrateAddress): number[] => {
      return claimedErasByValidator[validatorAddress] || [];
    },
    [claimedErasByValidator],
  );

  return {
    addClaimedEras,
    getClaimedEras,
    claimedErasByValidator,
  };
};
