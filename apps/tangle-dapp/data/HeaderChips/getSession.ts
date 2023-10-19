import { getPolkadotApi } from '../../constants';

export const getSession = async (): Promise<number> => {
  const api = await getPolkadotApi();

  if (!api) return NaN;

  try {
    const currentDKGPublicKey: any = await api.query.dkg.dkgPublicKey();
    const currentSessionNumber = currentDKGPublicKey[0];

    return Number(currentSessionNumber.toString());
  } catch (e: any) {
    console.error(e);

    return 0;
  }
};
