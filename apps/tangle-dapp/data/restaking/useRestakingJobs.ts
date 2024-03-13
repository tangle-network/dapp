import { useMemo } from 'react';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import substrateRoleToServiceType from '../../utils/substrateRoleToServiceType';

const useRestakingJobs = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  const { data: jobRoleIdPairsOpt } = usePolkadotApiRx((api) => {
    if (activeSubstrateAddress === null) {
      return null;
    }

    return api.query.jobs.validatorJobIdLookup(activeSubstrateAddress);
  });

  const hasActiveJobs =
    jobRoleIdPairsOpt === null ? null : jobRoleIdPairsOpt.isSome;

  const rolesWithJobs = useMemo(() => {
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

  return { hasActiveJobs, rolesWithJobs };
};

export default useRestakingJobs;
