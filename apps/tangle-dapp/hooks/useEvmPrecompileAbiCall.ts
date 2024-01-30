import { useCallback, useState } from 'react';

import {
  createEvmWalletClient,
  evmPublicClient,
} from '../constants/evmActions';
import {
  AbiFunctionName,
  getAbiForPrecompile,
  getAddressOfPrecompile,
  Precompile,
} from '../constants/evmPrecompiles';
import ensureError from '../utils/ensureError';
import useEvmAddress from './useEvmAddress';
import { EvmAddressOrHash } from './useEvmAddress';
import { TxStatus } from './useSubstrateTx';

// TODO: For some reason, Viem returns `any` for the tx receipt. Perhaps it is because it has no knowledge of the network, and thus no knowledge of its produced tx receipts. As a temporary workaround, use this custom type.
type TxReceipt = {
  transactionHash: EvmAddressOrHash;
  transactionIndex: number;
  blockHash: EvmAddressOrHash;
  from: EvmAddressOrHash;
  to: EvmAddressOrHash;
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
 * Obtain a function that can be used to perform a precompile contract call.
 *
 * @remarks
 * Precompiles run on the chain's EVM, and are used for performing actions
 * that are not possible to perform on the Substrate chain for EVM accounts
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

  const perform = useCallback(async () => {
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

  return { perform, status, error };
}

export default useEvmPrecompileAbiCall;
