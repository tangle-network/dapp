import { getPolkadotApi } from '../../constants';

export const getEra = async (): Promise<number> => {
  const api = await getPolkadotApi();

  if (!api) return 0;

  try {
    let activeEra = await api.query.staking.activeEra();
    activeEra = JSON.parse(JSON.stringify(activeEra)).index;

    return Number(activeEra.toString());
  } catch (e: any) {
    console.error(e);

    return 0;
  }
};
