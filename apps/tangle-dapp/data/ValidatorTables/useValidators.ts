import { AccountId32 } from '@polkadot/types/interfaces';
import { useMemo } from 'react';

import { Validator } from '../../types';
import createValidator from '../../utils/staking/createValidator';
import useStakingExposures from '../staking/useStakingExposures';
import useValidatorPrefs from '../staking/useValidatorPrefs';
import useValidatorIdentityNames from './useValidatorIdentityNames';

export const useValidators = (
  addresses: AccountId32[] | null,
  isActive: boolean
): Validator[] | null => {
  const { result: identities } = useValidatorIdentityNames();
  const { result: validatorPrefs } = useValidatorPrefs();
  const { result: exposures } = useStakingExposures();

  return useMemo(() => {
    if (
      addresses === null ||
      identities === null ||
      exposures === null ||
      validatorPrefs === null ||
      exposures === null
    ) {
      return null;
    }

    return addresses.map((accountId) =>
      createValidator({
        address: accountId.toString(),
        isActive,
        identities,
        exposures,
        prefs: validatorPrefs,
      })
    );
  }, [addresses, identities, exposures, validatorPrefs, isActive]);
};
