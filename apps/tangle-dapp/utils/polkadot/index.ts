import { getPolkadotApiPromise } from './api';

export * from './api';
export * from './bond';
export * from './nominators';
export * from './tokens';

export const getSlashingSpans = async (
  address: string
): Promise<string | undefined> => {
  const api = await getPolkadotApiPromise();

  if (!api) return '';

  const slashingSpans = await api.query.staking.slashingSpans(address);

  return slashingSpans.toString();
};
