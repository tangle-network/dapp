import { skipToken, useQuery } from '@tanstack/react-query';
import { getApiPromise } from '../utils/polkadot/api';

export const useApiPromiseQuery = (rpcEndpoint: string | undefined) => {
  return useQuery({
    queryKey: ['useApiPromise', rpcEndpoint],
    queryFn: rpcEndpoint ? () => getApiPromise(rpcEndpoint) : skipToken,
  });
};
