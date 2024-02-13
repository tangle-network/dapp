import useAgnosticTx from '../../hooks/useAgnosticTx';

/**
 * Performs the `vesting.vest` extrinsic call.
 *
 * This action will claim all **claimable** tokens from all vesting
 * schedules associated with the active account.
 *
 * Vesting schedules that have not yet started (i.e. have not reached their
 * "cliff") will be omitted.
 */
const useVestTx = (notifyVestTxStatusUpdates?: boolean) => {
  return useAgnosticTx(
    'vesting',
    'vest',
    [],
    (api) => Promise.resolve(api.tx.vesting.vest()),
    notifyVestTxStatusUpdates
  );
};

export default useVestTx;
