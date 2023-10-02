import type { MetricType } from '../../types';
import { EPOCH_DAY_INTERVAL } from '../../utils/date';
import getChangeRate from '../../utils/getChangeRate';
import { getDepositInTimeRange } from '../utils';

export default async function getKeyMetricDepositData(
  epochNow: number
): Promise<MetricType> {
  const [deposit24h, deposit48h] = await Promise.all([
    getDepositInTimeRange(epochNow - EPOCH_DAY_INTERVAL, epochNow),
    getDepositInTimeRange(
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
