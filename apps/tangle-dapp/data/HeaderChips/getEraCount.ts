import { getPolkadotApiPromise } from '../../constants';

export const getEraCount = async (): Promise<number> => {
  const api = await getPolkadotApiPromise();

  if (!api) return NaN;

  try {
    const activeEra = await api.query.staking.activeEra();
    const value = activeEra.unwrapOr(null);
    if (value == null) {
      return NaN;
    }

    return value.index.toNumber();
  } catch (e) {
    console.error(e);

    return NaN;
  }
};
