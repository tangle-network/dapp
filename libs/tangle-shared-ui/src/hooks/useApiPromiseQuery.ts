import { skipToken, useQuery } from '@tanstack/react-query';
import { getApiPromise } from '../utils/polkadot/api';

export const useApiPromiseQuery = (rpcEndpoints: string[] | undefined) => {
  return useQuery({
    queryKey: ['useApiPromise', rpcEndpoints],
    queryFn: rpcEndpoints ? () => getApiPromise(rpcEndpoints) : skipToken,
  });
};
