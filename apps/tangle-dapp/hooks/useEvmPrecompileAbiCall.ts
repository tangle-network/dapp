import { BN } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';
import { AddressType } from '@webb-tools/dapp-config/types';
import { useCallback, useState } from 'react';

import {
  AbiFunctionName,
  getPrecompileAbi,
  getPrecompileAddress,
  Precompile,
  PrecompileAddress,
} from '../constants/evmPrecompiles';
import ensureError from '../utils/ensureError';
import useEvmAddress from './useEvmAddress';
import { TxStatus } from './useSubstrateTx';
import useViemPublicClient from './useViemPublicClient';
import useViemWalletClient from './useViemWalletClient';

// TODO: For some reason, Viem returns `any` for the tx receipt. Perhaps it is because it has no knowledge of the network, and thus no knowledge of its produced tx receipts. As a temporary workaround, use this custom type.
type TxReceipt = {
  transactionHash: AddressType;
  transactionIndex: number;
  blockHash: AddressType;
  from: AddressType;
  to: AddressType | null;
  blockNumber: bigint;
  cumulativeGasUsed: bigint;
  gasUsed: bigint;
  logs: unknown[];
  logsBloom: string;
  status: 'success' | 'reverted';
  type: string;
  contractAddress: unknown | null;
};

export type EvmAbiCallArg = string | number | BN | boolean;

export type EvmBatchCallData = {
  to: PrecompileAddress;
  // TODO: Value should be strongly typed and explicit. Accept a generic type to accomplish this.
  value: EvmAbiCallArg | EvmAbiCallArg[];
  gasLimit: number;
  callData: string;
};

export type EvmAbiBatchCallArgs = (EvmAbiCallArg | EvmAbiCallArg[])[][];

export type EvmAbiCall<PrecompileT extends Precompile> = {
  functionName: AbiFunctionName<PrecompileT>;
  // TODO: Use argument types from the ABI for the specific function.
  arguments: EvmAbiCallArg[] | EvmAbiBatchCallArgs;
};

export type EvmTxFactory<PrecompileT extends Precompile, Context = void> = (
  context: Context
) => EvmAbiCall<PrecompileT> | null;

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
  Context = void
>(
  precompile: PrecompileT,
  factory: EvmTxFactory<PrecompileT, Context> | EvmAbiCall<PrecompileT>
) {
  const [status, setStatus] = useState(TxStatus.NOT_YET_INITIATED);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<HexString | null>(null);

  const activeEvmAddress = useEvmAddress();
  const viemPublicClient = useViemPublicClient();
  const viemWalletClient = useViemWalletClient();

  const execute = useCallback(
    async (context: Context) => {
      if (
        activeEvmAddress === null ||
        status === TxStatus.PROCESSING ||
        viemWalletClient === null ||
        viemPublicClient === null
      ) {
        return;
      }

      const factoryResult =
        factory instanceof Function ? factory(context) : factory;

      // Factory isn't ready yet.
      if (factoryResult === null) {
        return;
      }

      // Reset state to prepare for a new transaction.
      setError(null);
      setTxHash(null);
      setStatus(TxStatus.PROCESSING);

      try {
        const { request } = await viemPublicClient.simulateContract({
          address: getPrecompileAddress(precompile),
          abi: getPrecompileAbi(precompile),
          functionName: factoryResult.functionName,
          args: factoryResult.arguments,
          account: activeEvmAddress,
        });

        const newTxHash = await viemWalletClient.writeContract(request);

        setTxHash(newTxHash);

        const txReceipt: TxReceipt =
          await viemPublicClient.waitForTransactionReceipt({
            hash: newTxHash,
            // TODO: Make use of the `timeout` parameter, and error handle if it fails due to timeout.
          });

        console.debug('EVM transaction receipt:', txReceipt);

        setStatus(
          txReceipt.status === 'success' ? TxStatus.COMPLETE : TxStatus.ERROR
        );
      } catch (possibleError) {
        const error = ensureError(possibleError);

        setStatus(TxStatus.ERROR);
        setError(error);
      }
    },
    [
      activeEvmAddress,
      factory,
      precompile,
      status,
      viemPublicClient,
      viemWalletClient,
    ]
  );

  const reset = useCallback(() => {
    setStatus(TxStatus.NOT_YET_INITIATED);
    setError(null);
  }, []);

  // Prevent the consumer from executing the call if the active
  // account is not an EVM account.
  return {
    execute: activeEvmAddress !== null ? execute : null,
    reset,
    status,
    error,
    txHash,
  };
}

export default useEvmPrecompileAbiCall;
