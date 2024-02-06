import { useMemo } from 'react';
import { map } from 'rxjs';

import { SubstrateLockId } from '../constants';
import useBalancesLock from './useBalancesLock';
import usePolkadotApiRx from './usePolkadotApiRx';

const useDemocracy = () => {
  const { data: votes } = usePolkadotApiRx((api, activeSubstrateAddress) =>
    api.query.democracy.votingOf(activeSubstrateAddress)
  );

  const latestDirectVote = useMemo(() => {
    if (votes === null) {
      return null;
    } else if (votes.asDirect.votes.length === 0) {
      return null;
    }

    return votes.asDirect.votes[votes.asDirect.votes.length - 1];
  }, [votes]);

  const latestReferendumIndex = useMemo(() => {
    if (latestDirectVote === null) {
      return null;
    }

    return latestDirectVote[0];
  }, [latestDirectVote]);

  const { data: latestReferendum } = usePolkadotApiRx((api) => {
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
  });

  const { amount: lockedBalance } = useBalancesLock(SubstrateLockId.Democracy);

  return {
    lockedBalance,
    latestReferendum,
  };
};

export default useDemocracy;
