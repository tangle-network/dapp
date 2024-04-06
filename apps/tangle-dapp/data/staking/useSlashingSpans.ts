import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';

const useSlashingSpans = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  return usePolkadotApiRx((api) => {
    if (activeSubstrateAddress === null) {
      return null;
    }

    return api.query.staking.slashingSpans(activeSubstrateAddress);
  });
};

export default useSlashingSpans;
