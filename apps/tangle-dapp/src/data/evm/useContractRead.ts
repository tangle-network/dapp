import { PromiseOrT } from '@webb-tools/abstract-api-provider';
import { useCallback } from 'react';
import { Abi as ViemAbi, ContractFunctionName } from 'viem';

import useContractReadOnce, {
  ContractReadOptions,
} from './useContractReadOnce';
import { useQuery } from '@tanstack/react-query';

/**
 * Continuously reads a contract function, refreshing the value
 * at a specified interval.
 */
const useContractRead = <
  Abi extends ViemAbi,
  FunctionName extends ContractFunctionName<Abi, 'pure' | 'view'>,
>(
  abi: Abi,
  options:
    | ContractReadOptions<Abi, FunctionName>
    // Allow consumers to provide a function that returns the options.
    // This is useful for when the options are dependent on some state.
    | (() => PromiseOrT<ContractReadOptions<Abi, FunctionName> | null>),
) => {
  const readOnce = useContractReadOnce(abi);

  const fetcher = useCallback(async () => {
    // Not yet ready to fetch.
    if (readOnce === null) {
      return null;
    }

    const options_ = typeof options === 'function' ? await options() : options;

    // If the options are null, it means that the consumer
    // of this hook does not want to fetch the data at this time.
    if (options_ === null) {
      return null;
    }

    return await readOnce(options_);
  }, [options, readOnce]);

  const value = useQuery({
    queryKey: ['useContractRead', abi, options],
    queryFn: fetcher,
  });

  return value;
};

export default useContractRead;
