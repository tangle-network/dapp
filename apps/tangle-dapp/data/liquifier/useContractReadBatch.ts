import { PromiseOrT } from '@webb-tools/abstract-api-provider';
import { useCallback, useState } from 'react';
import {
  Abi as ViemAbi,
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionReturnType,
} from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import { IS_PRODUCTION_ENV } from '../../constants/env';
import ensureError from '../../utils/ensureError';
import usePolling from '../liquidStaking/usePolling';
import { ContractReadOptions } from './useContractReadOnce';
import useViemPublicClientWithChain from './useViemPublicClientWithChain';

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
  type ValueType = ContractFunctionReturnType<
    Abi,
    'pure' | 'view',
    FunctionName,
    ContractFunctionArgs<Abi, 'pure' | 'view', FunctionName>
  >;

  type ReturnType = (Error | Awaited<ValueType>)[];

  const [results, setResults] = useState<ReturnType | null>(null);

  // Use Sepolia testnet for development, and mainnet for production.
  // Some dummy contracts were deployed on Sepolia for testing purposes.
  const chain = IS_PRODUCTION_ENV ? mainnet : sepolia;

  const publicClient = useViemPublicClientWithChain(chain);

  const refresh = useCallback(async () => {
    // Not yet ready to fetch.
    if (publicClient === null) {
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

    const targets = options_.args.map((args) => ({
      abi: abi,
      ...options_,
      args,
    }));

    // See: https://viem.sh/docs/contract/multicall.html
    const promiseOfAll = await publicClient.multicall({
      // TODO: Viem is complaining about the type of `contracts` here.
      contracts: targets as any,
    });

    // TODO: Avoid casting to ReturnType. Viem is complaining, likely  because of the complexity of the types involved.
    const results = promiseOfAll.map((promise) => {
      if (promise.result === undefined) {
        return ensureError(promise.error);
      }

      return promise.result;
    }) as ReturnType;

    setResults(results);
  }, [abi, options, publicClient]);

  usePolling({ effect: refresh });

  return {
    results,
    refresh,
  };
};

export default useContractReadBatch;
