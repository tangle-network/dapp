import { PromiseOrT } from '@webb-tools/abstract-api-provider';
import { useCallback, useState } from 'react';
import { Abi as ViemAbi, ContractFunctionName } from 'viem';

import { IS_PRODUCTION_ENV } from '../../constants/env';
import usePolling from '../liquidStaking/usePolling';
import useContractReadOnce, {
  ContractReadOptions,
} from './useContractReadOnce';

export type ContractReadOptionsBatch<
  Abi extends ViemAbi,
  FunctionName extends ContractFunctionName<Abi, 'pure' | 'view'>,
> = Omit<ContractReadOptions<Abi, FunctionName>, 'args'> & {
  args: ContractReadOptions<Abi, FunctionName>['args'][];
};

const useContractReadBatch = <
  Abi extends ViemAbi,
  FunctionName extends ContractFunctionName<Abi, 'pure' | 'view'>,
>(
  abi: Abi,
  options:
    | ContractReadOptionsBatch<Abi, FunctionName>
    // Allow consumers to provide a function that returns the options.
    // This is useful for when the options are dependent on some state.
    | (() => PromiseOrT<ContractReadOptionsBatch<Abi, FunctionName> | null>),
) => {
  const [isPaused, setIsPaused] = useState(false);
  const readOnce = useContractReadOnce(abi);

  const fetcher = useCallback(async () => {
    // Not yet ready to fetch.
    if (isPaused || readOnce === null) {
      return null;
    }

    const options_ = typeof options === 'function' ? await options() : options;

    // If the options are null, it means that the consumer
    // of this hook does not want to fetch the data at this time.
    if (options_ === null) {
      return null;
    }
    // Remind developer about possible performance impact.
    else if (!IS_PRODUCTION_ENV && options_.args.length >= 50) {
      console.warn(
        'Reading a large amount of contracts simultaneously may affect performance, please consider utilizing pagination',
      );
    }

    const promises = options_.args.map((args) =>
      readOnce({ ...options_, args }),
    );

    return Promise.all(promises);
  }, [isPaused, options, readOnce]);

  const { value, isRefreshing } = usePolling({
    // By providing null, it signals to the hook to maintain
    // its current value and not refresh.
    fetcher: isPaused ? null : fetcher,
  });

  return { value, isRefreshing, isPaused, setIsPaused };
};

export default useContractReadBatch;
