import { HexString } from '@polkadot/util/types';
import { PromiseOrT } from '@webb-tools/abstract-api-provider';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import { useCallback, useState } from 'react';
import type { Hash, AbiFunction } from 'viem';
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from 'viem/actions';
import { useConnectorClient } from 'wagmi';

import {
  ExtractAbiFunctionNames,
  FindAbiArgsOf,
  PrecompileAddress,
} from '../constants/evmPrecompiles';
import useEvmAddress20 from './useEvmAddress';
import { TxStatus } from './useSubstrateTx';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';

export type AbiEncodeableValue = string | number | boolean | bigint;

export type AbiBatchCallData = {
  to: EvmAddress;
  // TODO: Value should be strongly typed and explicit. Accept a generic type to accomplish this.
  value: AbiEncodeableValue;
  gasLimit: number;
  callData: Hash;
};

export type AbiBatchCallArgs =
  | (AbiEncodeableValue | AbiEncodeableValue[])[][]
  | Readonly<[EvmAddress[], bigint[], Hash[], bigint[]]>;

export type AbiCall<
  Abi extends AbiFunction[],
  FunctionName extends ExtractAbiFunctionNames<Abi>,
> = {
  functionName: FunctionName;
  arguments: FindAbiArgsOf<Abi, FunctionName>;
};

export type EvmTxFactory<
  Abi extends AbiFunction[],
  FunctionName extends ExtractAbiFunctionNames<Abi>,
  Context = void,
> = (
  context: Context,
  activeEvmAddress20: EvmAddress,
) => PromiseOrT<AbiCall<Abi, FunctionName>> | null;

/**
 * Obtain a function that can be used to execute a precompile contract call.
 *
 * @remarks
 * Precompiles run on the chain's EVM, and are used for performing actions
 * that are not possible to execute on the Substrate chain for EVM accounts
 * (ex. those using MetaMask).
 *
 * This is used for performing actions from EVM accounts. Substrate accounts
 * should use `useSubstrateTx` for transactions instead, or `useApiRx` for queries.
 */
function useEvmPrecompileAbiCall<
  Abi extends AbiFunction[],
  FunctionName extends ExtractAbiFunctionNames<Abi>,
  Context = void,
>(
  abi: Abi,
  precompileAddress: PrecompileAddress,
  factory:
    | EvmTxFactory<Abi, FunctionName, Context>
    | AbiCall<Abi, FunctionName>,
  getSuccessMessage?: (context: Context) => string,
) {
  const [status, setStatus] = useState(TxStatus.NOT_YET_INITIATED);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<HexString | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeEvmAddress20 = useEvmAddress20();
  const { data: connectorClient } = useConnectorClient();

  const execute = useCallback(
    async (context: Context) => {
      if (
        activeEvmAddress20 === null ||
        status === TxStatus.PROCESSING ||
        connectorClient === undefined
      ) {
        return;
      }

      const factoryResult =
        factory instanceof Function
          ? await factory(context, activeEvmAddress20)
          : factory;

      // Factory isn't ready yet.
      if (factoryResult === null) {
        return;
      }

      // Reset state to prepare for a new transaction.
      setError(null);
      setTxHash(null);
      setStatus(TxStatus.PROCESSING);

      try {
        const { request } = await simulateContract(connectorClient, {
          address: precompileAddress,
          // TODO: Find a way to avoid casting.
          abi: abi satisfies AbiFunction[] as AbiFunction[],
          functionName: factoryResult.functionName,
          args: factoryResult.arguments,
          account: activeEvmAddress20,
        });

        const newTxHash = await writeContract(connectorClient, request);

        setTxHash(newTxHash);

        const txReceipt = await waitForTransactionReceipt(connectorClient, {
          hash: newTxHash,
          // TODO: Make use of the `timeout` parameter, and error handle if it fails due to timeout.
        });

        console.debug(
          'EVM pre-compile ABI call transaction receipt:',
          txReceipt,
        );

        setStatus(
          txReceipt.status === 'success' ? TxStatus.COMPLETE : TxStatus.ERROR,
        );

        if (txReceipt.status === 'success') {
          setSuccessMessage(
            getSuccessMessage !== undefined ? getSuccessMessage(context) : null,
          );
        }
      } catch (possibleError) {
        // Useful for debugging.
        console.debug(possibleError);

        const error = ensureError(possibleError);

        setStatus(TxStatus.ERROR);
        setError(error);
      }
    },
    [
      activeEvmAddress20,
      status,
      connectorClient,
      factory,
      precompileAddress,
      abi,
      getSuccessMessage,
    ],
  );

  const reset = useCallback(() => {
    setStatus(TxStatus.NOT_YET_INITIATED);
    setError(null);
  }, []);

  // Prevent the consumer from executing the call if the active
  // account is not an EVM account.
  return {
    execute: activeEvmAddress20 !== null ? execute : null,
    reset,
    status,
    error,
    txHash,
    successMessage,
  };
}

export default useEvmPrecompileAbiCall;
