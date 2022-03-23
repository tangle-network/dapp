import { useWebContext } from '@webb-dapp/react-environment';
import { WebbApiProvider } from '@webb-tools/api-providers';

/**
 * @name useApi
 * @description get api context value
 */
export const useApi = (): WebbApiProvider<unknown> | null => {
  const a = useWebContext();
  return a?.activeApi ?? null;
};
