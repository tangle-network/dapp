import type { ApiRx } from '@polkadot/api';
import { type BN, BN_ZERO } from '@polkadot/util';
import { useCallback } from 'react';
import { map, type Observable } from 'rxjs';
import { formatUnits } from 'viem';

import { TANGLE_TOKEN_DECIMALS } from '../../constants';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useRestakingEraReward from './useRestakingEraReward';

const useRestakingAPY = () => {
  const { data: activeRestakerEra } = usePolkadotApiRx(
    useCallback(
      (apiRx) =>
        apiRx.query.roles.activeRestakerEra
          ? apiRx.query.roles.activeRestakerEra()
          : null,
      []
    )
  );

  const { data: currentEraRewards } = useRestakingEraReward(
    activeRestakerEra?.unwrapOr(null)?.index.toNumber()
  );

  const { data: totalRestakedBN } = usePolkadotApiRx(getTotalRestaked);

  if (
    currentEraRewards === null ||
    totalRestakedBN === null ||
    totalRestakedBN.isZero()
  ) {
    return null;
  }

  const totalRestaked = formatUnits(
    BigInt(totalRestakedBN.toString()),
    TANGLE_TOKEN_DECIMALS
  );

  const rewardRate = currentEraRewards / +totalRestaked;

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
    })
  );
};
