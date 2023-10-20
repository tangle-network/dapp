import { getPolkadotApi } from '../../constants';
import { BN_ZERO } from '@polkadot/util';
import { calculateInflation } from '../../utils';

export const getIdealStakedPercentage = async (): Promise<number> => {
  const api = await getPolkadotApi();

  if (!api) return NaN;

  try {
    const inflation = calculateInflation(api, BN_ZERO, BN_ZERO, BN_ZERO);

    const idealStakePercentage = inflation.idealStake * 100;

    return idealStakePercentage;
  } catch (e: any) {
    console.error(e);

    return NaN;
  }
};
