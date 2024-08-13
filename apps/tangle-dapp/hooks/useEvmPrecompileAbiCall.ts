import { BN } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';
import { PromiseOrT } from '@webb-tools/abstract-api-provider';
import { AddressType } from '@webb-tools/dapp-config/types';
import { useCallback, useEffect, useState } from 'react';
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from 'viem/actions';
import { useConnectorClient } from 'wagmi';

import {
  AbiFunctionName,
  getPrecompileAbi,
  getPrecompileAddress,
  Precompile,
  PrecompileAddress,
} from '../constants/evmPrecompiles';
import ensureError from '../utils/ensureError';
import useEvmAddress20 from './useEvmAddress';
import { TxStatus } from './useSubstrateTx';

export type AbiCallArg = string | number | BN | boolean;

export type AbiEncodeableValue = string | number | boolean | bigint;

export type AbiBatchCallData = {
  to: PrecompileAddress;
  // TODO: Value should be strongly typed and explicit. Accept a generic type to accomplish this.
  value: AbiEncodeableValue | AbiEncodeableValue[];
  gasLimit: number;
  callData: string;
};

export type AbiBatchCallArgs = (AbiEncodeableValue | AbiEncodeableValue[])[][];

export type AbiCall<PrecompileT extends Precompile> = {
  functionName: AbiFunctionName<PrecompileT>;
  // TODO: Use argument types from the ABI for the specific function.
  arguments: AbiCallArg[] | AbiBatchCallArgs;
};

export type EvmTxFactory<PrecompileT extends Precompile, Context = void> = (
  context: Context,
) => PromiseOrT<AbiCall<PrecompileT>> | null;

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
  PrecompileT extends Precompile,
  Context = void,
>(
  precompile: PrecompileT,
  factory: EvmTxFactory<PrecompileT, Context> | AbiCall<PrecompileT>,
  getSuccessMessageFnc?: (context: Context) => string,
) {
  const [status, setStatus] = useState(TxStatus.NOT_YET_INITIATED);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<HexString | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeEvmAddress20 = useEvmAddress20();
  const { data: connectorClient } = useConnectorClient();

  // Useful for debugging.
  useEffect(() => {
    if (error !== null) {
      console.error(error);
    }
  }, [error]);

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
        factory instanceof Function ? await factory(context) : factory;

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
          address: getPrecompileAddress(precompile),
          abi: getPrecompileAbi(precompile),
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
            getSuccessMessageFnc !== undefined
              ? getSuccessMessageFnc(context)
              : null,
          );
        }
      } catch (possibleError) {
        const error = ensureError(possibleError);

        setStatus(TxStatus.ERROR);
        setError(error);
      }
    },
    // prettier-ignore
    [activeEvmAddress20, status, connectorClient, factory, precompile, getSuccessMessageFnc],
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
