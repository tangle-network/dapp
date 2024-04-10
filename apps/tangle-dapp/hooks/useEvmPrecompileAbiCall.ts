import { AddressType } from '@webb-tools/dapp-config/types';
import { useCallback, useState } from 'react';

import {
  AbiFunctionName,
  getAbiForPrecompile,
  getAddressOfPrecompile,
  Precompile,
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

export type EvmAbiCallData<PrecompileT extends Precompile> = {
  functionName: AbiFunctionName<PrecompileT>;
  // TODO: Use argument types from the ABI.
  arguments: unknown[];
};

export type EvmTxFactory<PrecompileT extends Precompile, Context> = (
  context: Context
) => EvmAbiCallData<PrecompileT> | null;

/**
 * Obtain a function that can be used to execute a precompile contract call.
 *
 * @remarks
 * Precompiles run on the chain's EVM, and are used for performing actions
 * that are not possible to execute on the Substrate chain for EVM accounts
 * (ex. those using MetaMask).
 *
 * This is used for performing actions from EVM accounts. Substrate accounts
 * should use `useSubstrateTx` for transactions instead, or `usePolkadotApi` for queries.
 */
function useEvmPrecompileAbiCall<
  PrecompileT extends Precompile,
  Context = void
>(
  precompile: PrecompileT,
  factory: EvmTxFactory<PrecompileT, Context> | EvmAbiCallData<PrecompileT>
) {
  const [status, setStatus] = useState(TxStatus.NOT_YET_INITIATED);
  const [error, setError] = useState<Error | null>(null);
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

      setError(null);
      setStatus(TxStatus.PROCESSING);

      try {
        const { request } = await viemPublicClient.simulateContract({
          address: getAddressOfPrecompile(precompile),
          abi: getAbiForPrecompile(precompile),
          functionName: factoryResult.functionName,
          args: factoryResult.arguments,
          account: activeEvmAddress,
        });

        const txHash = await viemWalletClient.writeContract(request);

        const txReceipt: TxReceipt =
          await viemPublicClient.waitForTransactionReceipt({
            hash: txHash,
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

      // TODO: Return clean up.
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

  // Prevent the consumer from executing the call if the active
  // account is not an EVM account.
  return { execute: activeEvmAddress !== null ? execute : null, status, error };
}

export default useEvmPrecompileAbiCall;
