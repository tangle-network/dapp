import { formatEther } from 'viem';
import type { ChartDataRecord, EpochResponse } from '../types';

function serializeEpochData(epochData: Array<EpochResponse>): ChartDataRecord {
  return epochData.reduce((prev, current) => {
    Object.keys(current).forEach((epoch) => {
      if (!prev[epoch]) prev[epoch] = 0;
      prev[epoch] += +formatEther(BigInt(current[epoch]));
    });
    return prev;
  }, {} as ChartDataRecord);
}

export default serializeEpochData;
