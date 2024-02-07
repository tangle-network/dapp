import { Option, Vec } from '@polkadot/types';
import { PalletVestingVestingInfo } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { useMemo } from 'react';

import { SubstrateLockId } from '../../constants/index';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useBalancesLock from '../balances/useBalancesLock';

export type VestingInfo = {
  /**
   * Whether or not the account is currently vesting.
   *
   * This represents whether the active account has at least one
   * vesting schedule.
   */
  isVesting: boolean | null;

  /**
   * Information from Substrate vesting schedules associated with
   * the active account.
   */
  schedulesOpt: Option<Vec<PalletVestingVestingInfo>> | null;

  /**
   * The amount of tokens that can be claimed by the active account.
   *
   * Note that this does not represent the **total** amount of tokens
   * locked in all vesting schedules, but rather the amount of tokens
   * that has been vested by the vesting schedules, and that is now
   * **claimable** by the active account, by calling the `vesting.vest`
   * extrinsic.
   */
  claimableTokenAmount: BN | null;

  /**
   * Whether or not the active account has any claimable tokens stemming
   * from vesting schedules.
   */
  hasClaimableTokens: boolean;

  currentBlockNumber: BN | null;
};

/**
 * Fetch essential vesting information from Substrate such as the vesting
 * schedules, and enable the execution of the `vest` Substrate transaction
 * for the active account.
 *
 * This is an account-agnostic hook, meaning that it will work for both
 * Substrate and EVM accounts.
 */
const useVestingInfo = (): VestingInfo => {
  const { data: vestingSchedulesOpt } = usePolkadotApiRx(
    (api, activeSubstrateAddress) =>
      api.query.vesting.vesting(activeSubstrateAddress)
  );

  const { data: currentBlockNumber } = usePolkadotApiRx((api) =>
    api.derive.chain.bestNumber()
  );

  const { amount: vestingLockAmount } = useBalancesLock(
    SubstrateLockId.Vesting
  );

  const totalVestingAmount = useMemo(() => {
    if (vestingSchedulesOpt === null || vestingSchedulesOpt.isNone) {
      return null;
    }

    const vestingSchedules = vestingSchedulesOpt.unwrap();
    let total = new BN(0);

    for (const vestingSchedule of vestingSchedules) {
      total = total.add(vestingSchedule.locked);
    }

    return total;
  }, [vestingSchedulesOpt]);

  // The total amount of tokens that has been released by existing
  // vesting schedules so far, including vested/claimed tokens.
  const totalReleasedAmount = useMemo(() => {
    if (
      vestingSchedulesOpt === null ||
      vestingSchedulesOpt.isNone ||
      currentBlockNumber === null ||
      totalVestingAmount === null ||
      vestingLockAmount === null
    ) {
      return null;
    }

    const vestingSchedules = vestingSchedulesOpt.unwrap();
    let totalReleased = new BN(0);

    for (const vestingSchedule of vestingSchedules) {
      // This vesting schedule has not yet reached its "cliff", so
      // omit it since it is not relevant for the claimable amount.
      if (vestingSchedule.startingBlock.gt(currentBlockNumber)) {
        continue;
      }

      const blocksPassed = currentBlockNumber.sub(
        vestingSchedule.startingBlock
      );

      const released = blocksPassed.mul(vestingSchedule.perBlock);

      totalReleased = totalReleased.add(released);
    }

    // The total released amount cannot exceed the total vested amount.
    // Without this, the total released amount would eventually exceed
    // the total vested amount, displaying incorrect information.
    return BN.min(totalReleased, totalVestingAmount);
  }, [
    currentBlockNumber,
    totalVestingAmount,
    vestingSchedulesOpt,
    vestingLockAmount,
  ]);

  const claimableAmount = useMemo(() => {
    if (
      totalVestingAmount === null ||
      totalReleasedAmount === null ||
      vestingLockAmount === null
    ) {
      return null;
    }
    // If there's no vesting schedule(s), there's nothing to claim.
    else if (totalVestingAmount.isZero()) {
      return new BN(0);
    }
    // Nothing locked in vesting, which means that everything is
    // ready to be claimed.
    else if (vestingLockAmount.isZero()) {
      return totalVestingAmount;
    }

    // Claimable = total released - (total vested - vesting lock amount).
    return totalReleasedAmount.sub(totalVestingAmount.sub(vestingLockAmount));
  }, [totalVestingAmount, totalReleasedAmount, vestingLockAmount]);

  return {
    isVesting: totalVestingAmount !== null && !totalVestingAmount.isZero(),
    schedulesOpt: vestingSchedulesOpt,
    claimableTokenAmount: claimableAmount,
    hasClaimableTokens: claimableAmount !== null && !claimableAmount.isZero(),
    currentBlockNumber,
  };
};

export default useVestingInfo;
