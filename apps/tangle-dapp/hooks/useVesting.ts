import { Option, Vec } from '@polkadot/types';
import { PalletVestingVestingInfo } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { useMemo } from 'react';

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
   * **claimable** by the active account.
   */
  claimableTokenAmount: BN | null;

  /**
   * Whether or not the active account has any claimable tokens stemming
   * from vesting schedules.
   */
  hasClaimableTokens: boolean;

  vestTxStatus: TxStatus;

  /**
   * Performs the `vest` Substrate transaction.
   *
   * This transaction will claim all **claimable** tokens from all vesting
   * schedules associated with the active account.
   *
   * Vesting schedules that have not yet started (i.e. have not reached their
   * "cliff") will be omitted.
   */
  performVestTx: () => void;
};

/**
 * Fetch essential vesting information from Substrate, and enable the
 * execution of the `vest` Substrate transaction for the active account.
 *
 * This is an account-agnostic hook, meaning that it will work for both
 * Substrate and EVM accounts.
 */
const useVesting = (notifyVestTxStatusUpdates?: boolean): Vesting => {
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

  const totalVestedAmount = useMemo(() => {
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

  const totalReleasedAmount = useMemo(() => {
    if (
      vestingInfoOpt === null ||
      vestingInfoOpt.isNone ||
      currentBlockNumber === null ||
      totalVestedAmount === null
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
    return BN.min(totalReleased, totalVestedAmount);
  }, [currentBlockNumber, totalVestedAmount, vestingInfoOpt]);

  const claimableAmount = useMemo(() => {
    if (
      locks === null ||
      totalVestedAmount === null ||
      totalReleasedAmount === null
    ) {
      return null;
    }
    // If there's no vesting schedule(s), there's nothing to claim.
    else if (totalVestedAmount.isZero()) {
      return new BN(0);
    }

    // TODO: Find out if there's a better way to check the lock ID, perhaps Polkadot offers a constant for this. Otherwise, move this to a constant, and somehow attach type constraints to the different known lock IDs. There's also 'staking'. Check the Polkadot Explorer for debugging.
    const vestingLock = locks.find(
      (lock) => lock.id.toHuman()?.toString().trim() === 'vesting'
    );

    const vestingLockAmount = vestingLock?.amount ?? new BN(0);

    // Nothing locked in vesting, which means that everything is
    // ready to be claimed.
    if (vestingLockAmount.isZero()) {
      return totalVestedAmount;
    }

    // Claimable = total released - (total vested - vesting lock amount).
    return totalReleasedAmount.sub(totalVestedAmount.sub(vestingLockAmount));
  }, [locks, totalVestedAmount, totalReleasedAmount]);

  return {
    isVesting: vestingInfoOpt?.isSome ?? null,
    vestingInfo: vestingInfoOpt,
    performVestTx: () => void performAgnosticVestTx(),
    vestTxStatus: status,
    claimableTokenAmount: claimableAmount,
    hasClaimableTokens:
      claimableAmount !== null && claimableAmount.gt(new BN(0)),
  };
};

export default useVesting;
