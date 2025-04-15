import { skipToken, useQuery } from '@tanstack/react-query';
import { getApiRx } from '../utils/polkadot/api';

export const useApiRxQuery = (rpcEndpoint: string | undefined) => {
  return useQuery({
    queryKey: ['useApiRx', rpcEndpoint],
    queryFn: rpcEndpoint ? () => getApiRx(rpcEndpoint) : skipToken,
  });
};
