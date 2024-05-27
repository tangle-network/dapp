import { BN_MILLION, BN_ZERO } from '@polkadot/util';
import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';

const DEFAULT_FLAGS_ELECTED = {
  withController: true,
  withExposure: true,
  withExposureMeta: true,
  withPrefs: true,
};

const useActualStakedPercentage = () => {
  const { result: totalIssuance } = useApiRx(
    useCallback((api) => api.query.balances.totalIssuance(), [])
  );

  const { result: electedInfo } = useApiRx(
    useCallback(
      (api) => api.derive.staking.electedInfo(DEFAULT_FLAGS_ELECTED),
      []
    )
  );

  const totalStakedFromElected = useMemo(() => {
    if (!electedInfo) {
      return null;
    }

    return electedInfo.info.reduce(
      (stakedTotal, { exposurePaged, exposureMeta }) => {
        const expMetaTotal =
          exposurePaged.isSome && exposureMeta.isSome
            ? exposureMeta.unwrap().total.unwrap()
            : BN_ZERO;

        return stakedTotal.add(expMetaTotal);
      },
      BN_ZERO
    );
  }, [electedInfo]);

  return useMemo(() => {
    if (totalStakedFromElected === null || totalIssuance === null) {
      return null;
    }

    const stakedFraction =
      totalStakedFromElected.isZero() || totalIssuance.isZero()
        ? 0
        : totalStakedFromElected.mul(BN_MILLION).div(totalIssuance).toNumber() /
          BN_MILLION.toNumber();

    return (stakedFraction * 100).toFixed(1);
  }, [totalIssuance, totalStakedFromElected]);
};

export default useActualStakedPercentage;
