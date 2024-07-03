import { AccountId32 } from '@polkadot/types/interfaces';
import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import { Validator } from '../../types';
import createValidator from '../../utils/staking/createValidator';
import useStakingExposures2 from '../staking/useStakingExposures2';
import useValidatorPrefs from '../staking/useValidatorPrefs';
import useValidatorIdentityNames from './useValidatorIdentityNames';

export const useValidators = (
  addresses: AccountId32[] | null,
  isActive: boolean,
): Validator[] | null => {
  const { result: identityNames } = useValidatorIdentityNames();
  const { result: validatorPrefs } = useValidatorPrefs();
  const { result: exposures } = useStakingExposures2(isActive);

  const { result: nominations } = useApiRx(
    useCallback((api) => api.query.staking.nominators.entries(), []),
  );

  return useMemo(
    () => {
      if (
        addresses === null ||
        identityNames === null ||
        exposures === null ||
        nominations === null ||
        validatorPrefs === null
      ) {
        return null;
      }

      return addresses.map((accountId) =>
        createValidator({
          address: accountId.toString(),
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
    },
    // prettier-ignore
    [addresses, exposures, identityNames, isActive, nominations, validatorPrefs],
  );
};
