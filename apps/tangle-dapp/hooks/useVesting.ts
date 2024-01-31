import { Option, Vec } from '@polkadot/types';
import { PalletVestingVestingInfo } from '@polkadot/types/lookup';
import { BN, u8aToString } from '@polkadot/util';
import { useMemo } from 'react';

import { LockId } from '../constants/polkadotApiUtils';
import useAgnosticTx from './useAgnosticTx';
import usePolkadotApiRx from './usePolkadotApiRx';
import { TxStatus } from './useSubstrateTx';

export type Vesting = {
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
  vestingInfo: Option<Vec<PalletVestingVestingInfo>> | null;

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

  vestTxStatus: TxStatus;

  /**
   * Performs the `vesting.vest` extrinsic call.
   *
   * This action will claim all **claimable** tokens from all vesting
   * schedules associated with the active account.
   *
   * Vesting schedules that have not yet started (i.e. have not reached their
   * "cliff") will be omitted.
   */
  executeVestTx: () => void;
};

/**
 * Fetch essential vesting information from Substrate, and enable the
 * execution of the `vest` Substrate transaction for the active account.
 *
 * This is an account-agnostic hook, meaning that it will work for both
 * Substrate and EVM accounts.
 */
const useVesting = (notifyVestTxStatusUpdates?: boolean): Vesting => {
  const { execute: executeAgnosticVestTx, status } = useAgnosticTx(
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

  const vestingLockAmount = useMemo(() => {
    if (locks === null) {
      return null;
    }

    const vestingLock = locks.find(
      // For some reason, the lock id has an extra space at the end when
      // converted to a string, so trim it.
      (lock) => u8aToString(lock.id).trim() === LockId.Vesting
    );

    return vestingLock?.amount ?? new BN(0);
  }, [locks]);

  const totalVestingAmount = useMemo(() => {
    if (vestingInfoOpt === null || vestingInfoOpt.isNone) {
      return null;
    }

    const vestingInfo = vestingInfoOpt.unwrap();
    let total = new BN(0);

    for (const vestingSchedule of vestingInfo) {
      total = total.add(vestingSchedule.locked);
    }

    return total;
  }, [vestingInfoOpt]);

  // The total amount of tokens that has been released by existing
  // vesting schedules so far, including vested/claimed tokens.
  const totalReleasedAmount = useMemo(() => {
    if (
      vestingInfoOpt === null ||
      vestingInfoOpt.isNone ||
      currentBlockNumber === null ||
      totalVestingAmount === null ||
      vestingLockAmount === null
    ) {
      return null;
    }

    const vestingInfo = vestingInfoOpt.unwrap();
    let totalReleased = new BN(0);

    for (const vestingSchedule of vestingInfo) {
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
    vestingInfoOpt,
    vestingLockAmount,
  ]);

  const claimableAmount = useMemo(() => {
    if (
      locks === null ||
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
  }, [locks, totalVestingAmount, totalReleasedAmount, vestingLockAmount]);

  return {
    isVesting: totalVestingAmount !== null && !totalVestingAmount.isZero(),
    vestingInfo: vestingInfoOpt,
    executeVestTx: () => void executeAgnosticVestTx(),
    vestTxStatus: status,
    claimableTokenAmount: claimableAmount,
    hasClaimableTokens: claimableAmount !== null && !claimableAmount.isZero(),
  };
};

export default useVesting;
