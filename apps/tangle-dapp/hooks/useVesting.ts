import usePolkadotApiRx from './usePolkadotApiRx';
import useTx from './useTx';

const useVesting = () => {
  const { perform: performVestTx, status: vestTxStatus } = useTx((api) =>
    Promise.resolve(api.tx.vesting.vest())
  );

  const { data: vestingInfo } = usePolkadotApiRx((api, activeAccountAddress) =>
    api.query.vesting.vesting(activeAccountAddress)
  );

  return {
    isVesting: vestingInfo?.isSome ?? null,
    vestingInfo,
    performVestTx,
    vestTxStatus,
    hasClaimableTokens: true,
  };
};

export default useVesting;
