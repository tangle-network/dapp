import { AddressType } from '@webb-tools/dapp-config/types';
import { useCallback, useState } from 'react';

import {
  AbiFunctionName,
  getAbiForPrecompile,
  getAddressOfPrecompile,
  Precompile,
} from '../constants/evmPrecompiles';
import ensureError from '../utils/ensureError';
import { createEvmWalletClient, evmPublicClient } from '../utils/evm';
import useEvmAddress from './useEvmAddress';
import { TxStatus } from './useSubstrateTx';

// TODO: For some reason, Viem returns `any` for the tx receipt. Perhaps it is because it has no knowledge of the network, and thus no knowledge of its produced tx receipts. As a temporary workaround, use this custom type.
type TxReceipt = {
  transactionHash: AddressType;
  transactionIndex: number;
  blockHash: AddressType;
  from: AddressType;
  to: AddressType;
  blockNumber: bigint;
  cumulativeGasUsed: bigint;
  gasUsed: bigint;
  logs: unknown[];
  logsBloom: string;
  status: 'success' | 'failure';
  type: string;
  contractAddress: unknown | null;
};

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
function useEvmPrecompileAbiCall<T extends Precompile>(
  precompile: T,
  functionName: AbiFunctionName<T>,
  args: unknown[]
) {
  const [status, setStatus] = useState(TxStatus.NotYetInitiated);
  const [error, setError] = useState<Error | null>(null);
  const activeEvmAddress = useEvmAddress();

  const execute = useCallback(async () => {
    if (activeEvmAddress === null || status === TxStatus.Processing) {
      return;
    }

    setError(null);
    setStatus(TxStatus.Processing);

    try {
      const { request } = await evmPublicClient.simulateContract({
        address: getAddressOfPrecompile(precompile),
        abi: getAbiForPrecompile(precompile),
        functionName: functionName,
        args,
        account: activeEvmAddress,
      });

      const evmWalletClient = createEvmWalletClient(activeEvmAddress);
      const txHash = await evmWalletClient.writeContract(request);

      const txReceipt: TxReceipt =
        await evmPublicClient.waitForTransactionReceipt({
          hash: txHash,
          // TODO: Make use of the `timeout` parameter, and error handle if it fails due to timeout.
        });

      console.debug('txReceipt', txReceipt);

      setStatus(
        txReceipt.status === 'success' ? TxStatus.Complete : TxStatus.Error
      );
    } catch (possibleError) {
      const error = ensureError(possibleError);

      setStatus(TxStatus.Error);
      setError(error);
    }

    // TODO: Return clean up.
  }, [activeEvmAddress, args, precompile, status, functionName]);

  // Prevent the consumer from executing the call if the active
  // account is not an EVM account.
  return { execute: activeEvmAddress !== null ? execute : null, status, error };
}

export default useEvmPrecompileAbiCall;
