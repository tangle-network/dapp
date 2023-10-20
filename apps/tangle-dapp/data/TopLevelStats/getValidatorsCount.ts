import { getPolkadotApi } from '../../constants';

export const getValidatorsCount = async (): Promise<number> => {
  const api = await getPolkadotApi();

  if (!api) return NaN;

  try {
    const overview = await api.derive.staking.overview();
    const validatorsCount = overview.validatorCount;

    return Number(validatorsCount.toString());
  } catch (e: any) {
    console.error(e);

    return NaN;
  }
};
