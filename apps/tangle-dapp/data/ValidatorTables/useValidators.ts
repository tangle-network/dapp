import { AccountId32 } from '@polkadot/types/interfaces';
import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import { Validator } from '../../types';
import createValidator from '../../utils/staking/createValidator';
import useAllRestakingLedgers from '../restaking/useAllRestakingLedgers';
import useRestakingJobIdMap from '../restaking/useRestakingJobIdMap';
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
  const { result: restakingLedgers } = useAllRestakingLedgers();
  const { result: jobIdLookups } = useRestakingJobIdMap();

  const { result: nominations } = useApiRx(
    useCallback((api) => api.query.staking.nominators.entries(), []),
  );

  const { result: activeJobs } = useApiRx(
    useCallback((api) => api.query.jobs.submittedJobs.entries(), []),
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
        prefs: validatorPrefs,
        restakingLedgers,
        jobs: jobIdLookups,
        activeJobIds: activeJobs,
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
