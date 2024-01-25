import useAgnosticTx from './useAgnosticTx';
import usePolkadotApiRx from './usePolkadotApiRx';

const useVesting = (notifyVestTxStatusUpdates?: boolean) => {
  const { perform: performAgnosticVestTx, status } = useAgnosticTx(
    'vesting',
    'vest',
    [],
    (api) => Promise.resolve(api.tx.vesting.vest()),
    notifyVestTxStatusUpdates
  );

  const { data: vestingInfo } = usePolkadotApiRx((api, activeAccountAddress) =>
    api.query.vesting.vesting(activeAccountAddress)
  );

  return {
    isVesting: vestingInfo?.isSome ?? null,
    vestingInfo,
    performVestTx: performAgnosticVestTx,
    vestTxStatus: status,
    hasClaimableTokens: true,
  };
};

export default useVesting;
