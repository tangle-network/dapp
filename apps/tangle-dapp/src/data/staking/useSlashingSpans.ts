import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';

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
