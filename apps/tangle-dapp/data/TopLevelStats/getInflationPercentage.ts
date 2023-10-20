import { getPolkadotApi } from '../../constants';
import { BN_ZERO } from '@polkadot/util';
import { calculateInflation } from '../../utils';

export const getInflationPercentage = async (): Promise<number> => {
  const api = await getPolkadotApi();

  if (!api) return NaN;

  try {
    const inflation = calculateInflation(api, BN_ZERO, BN_ZERO, BN_ZERO);

    const inflationPercentage = inflation.inflation;

    console.log('inflationPercentage', inflationPercentage);

    return inflationPercentage;
  } catch (e: any) {
    console.error(e);

    return NaN;
  }
};
