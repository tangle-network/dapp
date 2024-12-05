import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';

import useSubstrateAddress from '../../hooks/useSubstrateAddress';

const useSlashingSpans = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  return useApiRx((api) => {
    if (activeSubstrateAddress === null) {
      return null;
    }

    return api.query.staking.slashingSpans(activeSubstrateAddress);
  });
};

export default useSlashingSpans;
