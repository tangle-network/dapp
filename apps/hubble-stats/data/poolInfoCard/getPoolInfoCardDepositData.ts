import { MetricType } from '../../types';
import { getChangeRate, EPOCH_DAY_INTERVAL } from '../../utils';
import { getDepositInTimeRangeByVAnchor } from '../utils';

export default async function getPoolInfoCardDepositData(
  poolAddress: string,
  epochNow: number
): Promise<MetricType> {
  const [deposit24h, deposit48h] = await Promise.all([
    getDepositInTimeRangeByVAnchor(
      poolAddress,
      epochNow - EPOCH_DAY_INTERVAL,
      epochNow
    ),
    getDepositInTimeRangeByVAnchor(
      poolAddress,
      epochNow - 2 * EPOCH_DAY_INTERVAL,
      epochNow - EPOCH_DAY_INTERVAL
    ),
  ] as const);

  const depositChangeRate = getChangeRate(deposit24h, deposit48h);

  return {
    value: deposit24h,
    changeRate: depositChangeRate,
  };
}
