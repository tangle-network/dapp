import { getPolkadotApiPromise } from '../../constants';

export const getSessionCount = async (): Promise<number> => {
  const api = await getPolkadotApiPromise();

  if (!api) return NaN;

  try {
    const currentDKGPublicKey: any = await api.query.dkg.dkgPublicKey();
    const currentSessionNumber = currentDKGPublicKey[0];

    return Number(currentSessionNumber.toString());
  } catch (e: any) {
    console.error(e);

    return NaN;
  }
};
