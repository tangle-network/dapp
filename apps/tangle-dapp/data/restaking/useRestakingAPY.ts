import type { ApiRx } from '@polkadot/api';
import { type BN, BN_ZERO } from '@polkadot/util';
import fraction from '@webb-tools/webb-ui-components/utils/fraction';
import { useCallback } from 'react';
import { map, type Observable } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';
import useRestakingEraReward from './useRestakingEraReward';

const useRestakingAPY = () => {
  const { result: activeRestakerEra } = useApiRx(
    useCallback(
      (apiRx) =>
        apiRx.query.roles.activeRestakerEra
          ? apiRx.query.roles.activeRestakerEra()
          : null,
      [],
    ),
  );

  const { data: currentEraRewards } = useRestakingEraReward(
    activeRestakerEra?.unwrapOr(null)?.index.toNumber(),
  );

  const { result: totalRestaked } = useApiRx(getTotalRestaked);

  if (
    currentEraRewards === null ||
    totalRestaked === null ||
    totalRestaked.isZero()
  ) {
    return null;
  }

  const rewardRate = fraction(currentEraRewards, totalRestaked.toString());

  return (1 + rewardRate / 365) ** 365 - 1;
};

export default useRestakingAPY;

const getTotalRestaked = (api: ApiRx): Observable<BN> => {
  if (api.query.roles.totalRestake) {
    return api.query.roles
      .totalRestake()
      .pipe(map((totalRestaked) => totalRestaked.toBn()));
  }

  const ledgerEntries = api.query.roles.ledger.entries();

  return ledgerEntries.pipe(
    map((entries) => {
      return entries.reduce((acc, [, value]) => {
        if (value.isNone) {
          return acc;
        }

        return acc.add(value.unwrap().total.toBn());
      }, BN_ZERO);
    }),
  );
};
