import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { useCallback, useMemo } from 'react';
import { map } from 'rxjs';

import { SubstrateLockId } from '../../constants';
import useBalancesLock from '../balances/useBalancesLock';

const useDemocracy = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  const { result: votes } = useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        return api.query.democracy.votingOf(activeSubstrateAddress);
      },
      [activeSubstrateAddress],
    ),
  );

  const latestDirectVote = useMemo(() => {
    if (votes === null) {
      return null;
    } else if (votes.asDirect.votes.length === 0) {
      return null;
    }

    return votes.asDirect.votes[votes.asDirect.votes.length - 1];
  }, [votes]);

  const latestReferendumIndex = (() => {
    if (latestDirectVote === null) {
      return null;
    }

    return latestDirectVote[0];
  })();

  const { result: latestReferendum } = useApiRx(
    useCallback(
      (api) => {
        if (latestReferendumIndex === null) {
          return null;
        }

        return (
          api.query.democracy
            .referendumInfoOf(latestReferendumIndex)
            // The referendum information should be defined if the latest
            // referendum index is defined.
            .pipe(map((referendumOpt) => referendumOpt.unwrap()))
        );
      },
      [latestReferendumIndex],
    ),
  );

  const { amount: lockedBalance } = useBalancesLock(SubstrateLockId.DEMOCRACY);
  const isInDemocracy = lockedBalance === null ? null : lockedBalance.gtn(0);

  return {
    isInDemocracy,
    lockedBalance,
    latestReferendum,
  };
};

export default useDemocracy;
