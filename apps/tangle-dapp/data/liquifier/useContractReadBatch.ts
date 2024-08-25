import { PromiseOrT } from '@webb-tools/abstract-api-provider';
import { useCallback, useState } from 'react';
import {
  Abi as ViemAbi,
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionReturnType,
} from 'viem';

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
  type ReturnType = (
    | Error
    | Awaited<
        ContractFunctionReturnType<
          Abi,
          'pure' | 'view',
          FunctionName,
          ContractFunctionArgs<Abi, 'pure' | 'view', FunctionName>
        >
      >
  )[];

  const [value, setValue] = useState<ReturnType | null>(null);
  const readOnce = useContractReadOnce(abi);

  const refresh = useCallback(async () => {
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
    // Remind developer about possible performance impact.
    else if (!IS_PRODUCTION_ENV && options_.args.length >= 50) {
      console.warn(
        'Reading a large amount of contracts simultaneously may affect performance, please consider utilizing pagination',
      );
    }

    const promises = options_.args.map((args) =>
      readOnce({ ...options_, args }),
    );

    setValue(await Promise.all(promises));
  }, [options, readOnce]);

  usePolling({ effect: refresh });

  return {
    value,
    refresh,
  };
};

export default useContractReadBatch;
