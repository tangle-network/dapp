import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import substrateRoleToServiceType from '../../utils/restaking/substrateRoleToServiceType';

const useRestakingJobs = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  const { result: jobRoleIdPairsOpt } = useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        return api.query.jobs.validatorJobIdLookup(activeSubstrateAddress);
      },
      [activeSubstrateAddress]
    )
  );

  const hasActiveJobs =
    jobRoleIdPairsOpt === null ? null : jobRoleIdPairsOpt.isSome;

  const servicesWithJobs = useMemo(() => {
    if (jobRoleIdPairsOpt === null) {
      return null;
    } else if (jobRoleIdPairsOpt.isNone) {
      return [];
    }

    const jobRoleIdPairs = jobRoleIdPairsOpt.unwrap();

    return jobRoleIdPairs.map((jobRoleIdPair) =>
      substrateRoleToServiceType(jobRoleIdPair[0])
    );
  }, [jobRoleIdPairsOpt]);

  return {
    hasActiveJobs,
    servicesWithJobs,
  };
};

export default useRestakingJobs;
