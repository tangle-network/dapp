import { PromiseOrT } from '@webb-tools/abstract-api-provider';
import { useCallback, useState } from 'react';
import { Abi as ViemAbi, ContractFunctionName } from 'viem';

import usePolling, {
  PollingPrimaryCacheKey,
} from '../liquidStaking/usePolling';
import useContractRead, { ContractReadOptions } from './useContractRead';

const useContractReadSubscription = <
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
  const [isPaused, setIsPaused] = useState(false);
  const read = useContractRead(abi);

  const fetcher = useCallback(async () => {
    if (isPaused || read === null) {
      return null;
    }

    const options_ = typeof options === 'function' ? await options() : options;

    if (options_ === null) {
      return null;
    }

    return read(options_);
  }, [isPaused, options, read]);

  const { value, isRefreshing } = usePolling({
    // By providing null, it signals to the hook to maintain
    // its current value and not refresh.
    fetcher: isPaused ? null : fetcher,
    primaryCacheKey: PollingPrimaryCacheKey.CONTRACT_READ_SUBSCRIPTION,
    // TODO: Options include args, which may be objects. Having these objects be stable across renders is important for the intended caching behavior. Instead of using the options object directly, consider providing the user a way to specify a cache key.
    cacheKey: Object.values(options),
  });

  return { value, isRefreshing, isPaused, setIsPaused };
};

export default useContractReadSubscription;
