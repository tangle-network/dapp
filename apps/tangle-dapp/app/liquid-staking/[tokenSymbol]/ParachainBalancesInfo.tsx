'use client';

import { BN_ZERO } from '@polkadot/util';
import { FC, useMemo } from 'react';

import { LiquidStakingToken } from '../../../constants/liquidStaking';
import useParachainBalances from '../../../data/liquidStaking/useParachainBalances';
import formatTangleBalance from '../../../utils/formatTangleBalance';
import { isLiquidStakingToken } from './page';

export type ParachainBalancesInfoProps = {
  tokenSymbol: LiquidStakingToken;
};

const ParachainBalancesInfo: FC<ParachainBalancesInfoProps> = ({
  tokenSymbol,
}) => {
  const { result: balances } = useParachainBalances();

  const availableBalance = useMemo(() => {
    if (balances === null) {
      return null;
    }

    for (const encodedBalance of balances) {
      // TODO: Proper typing. This is currently very hacky.
      const entry = encodedBalance[0].args[1].toJSON() as Record<
        'lst',
        unknown | undefined
      >;

      if (entry.lst === undefined) {
        continue;
      }

      const token = entry.lst as string;
      console.debug(token, tokenSymbol, isLiquidStakingToken(token));

      if (isLiquidStakingToken(token) && token === tokenSymbol) {
        console.debug('got', encodedBalance[1].free.toString());
        return encodedBalance[1].free;
      }
    }

    return BN_ZERO;
  }, [balances, tokenSymbol]);

  const formattedBalance = useMemo(() => {
    if (availableBalance === null) {
      return null;
    }

    return formatTangleBalance(availableBalance, undefined, {
      forceUnit: '-',
      withAll: true,
    });
  }, [availableBalance]);

  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <div>Available {formattedBalance} {tokenSymbol}</div>
    </div>
  );
};

export default ParachainBalancesInfo;
