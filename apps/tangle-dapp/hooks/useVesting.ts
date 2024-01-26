import { BN } from '@polkadot/util';
import { useMemo } from 'react';

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

  const { data: vestingInfoOpt } = usePolkadotApiRx(
    (api, activeSubstrateAddress) =>
      api.query.vesting.vesting(activeSubstrateAddress)
  );

  const { data: currentBlockNumber } = usePolkadotApiRx((api) =>
    api.derive.chain.bestNumber()
  );

  const { data: locks } = usePolkadotApiRx((api, activeSubstrateAddress) =>
    api.query.balances.locks(activeSubstrateAddress)
  );

  // TODO: Calculate the claimable token amount.
  // const claimableTokenAmount = useMemo(() => {
  //   if (
  //     vestingInfoOpt === null ||
  //     vestingInfoOpt.isNone ||
  //     currentBlockNumber === null
  //   ) {
  //     return null;
  //   }

  //   const vestingInfo = vestingInfoOpt.unwrap();
  //   let total = new BN(0);

  //   for (const vestingSchedule of vestingInfo) {
  //     // If the vesting schedule hasn't started yet, skip it.
  //     // This is also known as the "cliff".
  //     if (vestingSchedule.startingBlock.gt(currentBlockNumber)) {
  //       continue;
  //     }

  //     const blocksVested = currentBlockNumber.sub(
  //       vestingSchedule.startingBlock
  //     );

  //     total = total.add(blocksVested.mul(vestingSchedule.perBlock));
  //   }

  //   return total;
  // }, [vestingInfoOpt, currentBlockNumber]);
  const claimableTokenAmount = useMemo(() => {
    if (
      vestingInfoOpt === null ||
      vestingInfoOpt.isNone ||
      currentBlockNumber === null ||
      locks === null
    ) {
      return null;
    }

    // TODO: Find out if there's a better way to check the lock ID, perhaps Polkadot offers a constant for this. Otherwise, move this to a constant, and somehow attach type constraints to the different known lock IDs. There's also 'staking'. Check the Polkadot Explorer for debugging.
    const vestingLock = locks.find(
      (lock) => lock.id.toHuman()?.toString().trim() === 'vesting'
    );

    return vestingLock?.amount.toBn() ?? new BN(0);
  }, [vestingInfoOpt, currentBlockNumber, locks]);

  return {
    isVesting: vestingInfoOpt?.isSome ?? null,
    vestingInfo: vestingInfoOpt,
    performVestTx: performAgnosticVestTx,
    vestTxStatus: status,
    claimableTokenAmount,
    hasClaimableTokens:
      claimableTokenAmount !== null && claimableTokenAmount.gt(new BN(0)),
  };
};

export default useVesting;
