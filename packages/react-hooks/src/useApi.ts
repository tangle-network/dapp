import { useContext } from 'react';

import { ApiContext, ApiContextData } from '@webb-dapp/react-environment';

/**
 * @name useApi
 * @description get api context value
 */
export const useApi = (): ApiContextData => {
  return useContext<ApiContextData>(ApiContext);
};
