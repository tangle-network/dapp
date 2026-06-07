import useLocalStorage, {
  LocalStorageKey,
} from '@tangle-network/tangle-shared-ui/hooks/useLocalStorage';
import { useCallback, useState } from 'react';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { NetworkId } from '@tangle-network/ui-components/constants/networks';

// Create a unique key by combining NetworkId and SubstrateAddress
type ValidatorKey = `${NetworkId}:${SubstrateAddress}`;

type ClaimedErasByValidator = Record<ValidatorKey, number[]>;

const createValidatorKey = (
  networkId: NetworkId,
  validatorAddress: SubstrateAddress,
): ValidatorKey => {
  return `${networkId}:${validatorAddress}`;
};

/**
 * Hook to manage claimed eras by validator address in local storage.
 *
 * @returns {ClaimedErasByValidator} claimed eras by validator address
 */
export const useClaimedEras = () => {
  const storage = useLocalStorage(LocalStorageKey.CLAIMED_ERAS_BY_VALIDATOR);
  const [claimedErasByValidator, setClaimedErasByValidator] =
    useState<ClaimedErasByValidator>({});
  const claimedEras = storage.valueOpt?.value ?? claimedErasByValidator;

  const addClaimedEras = useCallback(
    (
      networkId: NetworkId,
      validatorAddress: SubstrateAddress,
      eras: number[],
    ) => {
      const validatorKey = createValidatorKey(networkId, validatorAddress);
      const newClaimedEras = {
        ...claimedEras,
        [validatorKey]: [...(claimedEras[validatorKey] || []), ...eras].sort(
          (a, b) => a - b,
        ),
      };

      setClaimedErasByValidator(newClaimedEras);
      storage.set(newClaimedEras);

      return newClaimedEras;
    },
    [claimedEras, storage],
  );

  const getClaimedEras = useCallback(
    (networkId: NetworkId, validatorAddress: SubstrateAddress): number[] => {
      const validatorKey = createValidatorKey(networkId, validatorAddress);
      return claimedEras[validatorKey] || [];
    },
    [claimedEras],
  );

  return {
    addClaimedEras,
    getClaimedEras,
    claimedErasByValidator: claimedEras,
  };
};
