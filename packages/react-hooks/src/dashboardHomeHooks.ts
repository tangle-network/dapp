import useRequest from '@umijs/use-request';
import { get } from 'lodash';
import { useMemo } from 'react';

import { useConstants, useIssuance, useStakingPool } from './index';

type HooksReturnType = Record<string,
{
  value?: string;
  history?: {
    date: number;
    value: number;
  }[];
}>;

const useHistory = (sql: string): any => {
  const data = useRequest(() => ({
    method: 'GET',
    url: `https://pulse.acala.network/api/query?q=${sql}`
  }));

  const history = useMemo(() => {
    if (!data.data || !data.data.results) return [];
    const temp = get(data, 'data.results.0.series.0.values') as any[];

    return temp
      ?.filter((item) => item[1])
      ?.slice(-7)
      .map((item, index) => ({ date: index + 1, value: item[1] }));
  }, [data]);

  return history;
};

export const useDashboard = (): HooksReturnType => {
  const { stableCurrency } = useConstants();
  const audIssue = useIssuance(stableCurrency);
  const stakingPool = useStakingPool();

  const DOTStakedHistory = useHistory(
    'SELECT mean("amount") FROM "acala"."autogen"."dot-staked" WHERE time > now() - 8d AND time < now() GROUP BY time(1d)'
  );

  const aUSDIssuedHistory = useHistory(
    'SELECT MAX("amount") FROM "acala"."autogen"."issuance" WHERE time > now() - 8d AND time < now() AND asset = \'AUSD\' GROUP BY time(1d)'
  );
  const newAccountHistory = useHistory(
    'SELECT SUM("count") FROM "acala"."autogen"."new-account" WHERE time > now() - 8d AND time < now() GROUP BY time(1d)'
  );

  return useMemo(() => {
    return {
      DOTStaked: {
        history: DOTStakedHistory,
        value: stakingPool?.stakingPool.getCommunalBonded()?.toString(0)
      },
      aUSDIssued: {
        history: aUSDIssuedHistory,
        value: audIssue?.toString(0)
      },
      dailyTrascation: {
        history: []
      },
      dexDailyVolume: {
        history: []
      },
      newAccounts: {
        history: newAccountHistory,
        value: newAccountHistory?.[newAccountHistory.length - 1]?.value
      },
      totalAssetLocked: {
        history: []
      }
    };
  }, [audIssue, stakingPool, DOTStakedHistory, aUSDIssuedHistory, newAccountHistory]);
};
