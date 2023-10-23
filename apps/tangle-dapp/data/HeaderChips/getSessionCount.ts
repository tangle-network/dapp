import { getPolkadotApiPromise } from '../../constants';

export const getSessionCount = async (): Promise<number> => {
  const api = await getPolkadotApiPromise();

  if (!api) return NaN;

  try {
    const currentDKGPublicKey = await api.query.dkg.dkgPublicKey();
    const currentSessionNumber = currentDKGPublicKey[0];

    return currentSessionNumber.toNumber();
  } catch (e) {
    console.error(e);
    return NaN;
  }
};
