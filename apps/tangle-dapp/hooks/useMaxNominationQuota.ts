import { useCallback } from 'react';

import useApiRx from './useApiRx';

const useMaxNominationQuota = (): number => {
  const { result: maxNominationQuotaOpt } = useApiRx(
    useCallback((api) => api.query.staking.maxNominatorsCount(), []),
  );

  const maxNominatorQuota = maxNominationQuotaOpt?.unwrapOr(null) ?? null;

  // Default to 16 if the value is not available. It is
  // safe to convert to a number here, as the value is
  // a `u32`, which fits into a JavaScript number.
  return maxNominatorQuota?.toNumber() ?? 16;
};

export default useMaxNominationQuota;
