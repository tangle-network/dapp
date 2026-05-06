import { skipToken, useQuery } from '@tanstack/react-query';
import { getApiRx } from '../utils/polkadot/api';

export const useApiRxQuery = (rpcEndpoints: string[] | undefined) => {
  return useQuery({
    queryKey: ['useApiRx', rpcEndpoints],
    queryFn: rpcEndpoints ? () => getApiRx(rpcEndpoints) : skipToken,
  });
};
