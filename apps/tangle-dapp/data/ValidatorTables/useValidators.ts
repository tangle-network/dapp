import { AccountId32 } from '@polkadot/types/interfaces';
import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { Validator } from '../../types';
import createValidator from '../../utils/staking/createValidator';
import useCurrentEra from '../staking/useCurrentEra';
import useStakingExposures from '../staking/useStakingExposures';
import useValidatorPrefs from '../staking/useValidatorPrefs';
import useValidatorIdentityNames from './useValidatorIdentityNames';

export const useValidators = (
  addresses: AccountId32[] | null,
  isActive: boolean
): Validator[] | null => {
  const formatNativeTokenSymbol = useFormatNativeTokenAmount();
  const { result: currentEra } = useCurrentEra();
  const { result: identityNames } = useValidatorIdentityNames();
  const { result: validatorPrefs } = useValidatorPrefs();
  const { result: exposures } = useStakingExposures();

  const { result: nominations } = useApiRx(
    useCallback((api) => api.query.staking.nominators.entries(), [])
  );

  const { result: restakingLedgers } = useApiRx(
    useCallback((api) => api.query.roles.ledger.entries(), [])
  );

  const { result: jobIdLookups } = useApiRx(
    useCallback((api) => api.query.jobs.validatorJobIdLookup.entries(), [])
  );

  const { result: activeJobs } = useApiRx(
    useCallback((api) => api.query.jobs.submittedJobs.entries(), [])
  );

  return useMemo(() => {
    if (
      addresses === null ||
      identityNames === null ||
      exposures === null ||
      restakingLedgers === null ||
      nominations === null ||
      validatorPrefs === null ||
      jobIdLookups === null ||
      activeJobs === null
    ) {
      return null;
    }

    return addresses.map((accountId) =>
      createValidator({
        address: accountId.toString(),
        isActive,
        identities: identityNames,
        exposures,
        prefs: validatorPrefs,
        restakingLedgers,
        jobs: jobIdLookups,
        activeJobIds: activeJobs,
      })
    );
  }, [
    activeJobs,
    addresses,
    exposures,
    identityNames,
    isActive,
    jobIdLookups,
    nominations,
    restakingLedgers,
    validatorPrefs,
  ]);
};
