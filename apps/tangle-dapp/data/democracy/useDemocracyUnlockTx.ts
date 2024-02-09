import useSubstrateTx from '../../hooks/useSubstrateTx';

/**
 * Unlocks any tokens that were locked as part of a democracy vote,
 * and whose locks have expired.
 *
 * @remarks
 * This is a Substrate-only transaction (at least for now).
 */
const useDemocracyUnlockTx = () => {
  return useSubstrateTx(async (api, activeSubstrateAddress) =>
    api.tx.democracy.unlock(activeSubstrateAddress)
  );
};

export default useDemocracyUnlockTx;
