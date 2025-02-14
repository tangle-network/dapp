import { AccountId32 } from '@polkadot/types/interfaces';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import { useCallback, useMemo } from 'react';

import useValidatorPrefs from '../staking/useValidatorPrefs';
import useValidatorStakingExposures from '../staking/useValidatorStakingExposures';
import useValidatorIdentityNames from './useValidatorIdentityNames';
import { Validator } from '@webb-tools/tangle-shared-ui/types';
import createValidator from '../../utils/staking/createValidator';

export const useValidators = (
  addresses: AccountId32[] | null,
  isLoadingAddresses: boolean,
  isActive: boolean,
): {
  validators: Validator[] | null;
  isLoading: boolean;
} => {
  const { result: identityNames, isLoading: isLoadingIdentityNames } =
    useValidatorIdentityNames();

  const { result: validatorPrefs, isLoading: isLoadingValidatorPrefs } =
    useValidatorPrefs();

  const { result: exposures } = useValidatorStakingExposures(isActive);

  const { result: nominations, isLoading: isLoadingNominations } = useApiRx(
    useCallback((api) => api.query.staking.nominators.entries(), []),
  );

  const validators = useMemo(() => {
    if (
      addresses === null ||
      identityNames === null ||
      exposures === null ||
      nominations === null ||
      validatorPrefs === null
    ) {
      return null;
    }

    const uniqueAddresses = Array.from(
      new Set(
        addresses.map((accountId) =>
          assertSubstrateAddress(accountId.toString()),
        ),
      ),
    );

    return uniqueAddresses.map((address) =>
      createValidator({
        address,
        isActive,
        identities: identityNames,
        prefs: validatorPrefs,
        getExposure: (address) => {
          const exposure = exposures.get(address);

          if (exposure === undefined || exposure.exposureMeta === null) {
            return undefined;
          }

          return {
            own: exposure.exposureMeta.own.toBn(),
            total: exposure.exposureMeta.total.toBn(),
            nominatorCount: exposure.exposureMeta.nominatorCount.toNumber(),
          };
        },
      }),
    );
  }, [
    addresses,
    exposures,
    identityNames,
    isActive,
    nominations,
    validatorPrefs,
  ]);

  return {
    validators,
    isLoading:
      isLoadingAddresses ||
      isLoadingIdentityNames ||
      isLoadingValidatorPrefs ||
      isLoadingNominations,
  };
};
