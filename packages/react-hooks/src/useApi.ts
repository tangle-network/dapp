import { ApiContext, ApiContextData } from '@webb-dapp/react-environment';
import { useContext } from 'react';

/**
 * @name useApi
 * @description get api context value
 */
export const useApi = (): ApiContextData => {
  return useContext<ApiContextData>(ApiContext);
};
