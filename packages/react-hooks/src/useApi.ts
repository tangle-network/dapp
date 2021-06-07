import { useWebContext, WebbApiProvider } from '@webb-dapp/react-environment';

/**
 * @name useApi
 * @description get api context value
 */
export const useApi = (): WebbApiProvider<unknown> | null => {
  const a = useWebContext();
  return a?.activeApi ?? null;
};
