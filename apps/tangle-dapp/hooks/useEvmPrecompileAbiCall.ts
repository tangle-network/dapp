import { isEthereumAddress } from '@polkadot/util-crypto';
import { ensureHex } from '@webb-tools/dapp-config';
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
import useEvmAddress from './useEvmAddress';
import { TxStatus } from './useSubstrateTx';

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
  const activeEvmAddress = useEvmAddress();

  const perform = useCallback(async () => {
    if (
      activeEvmAddress === null ||
      !isEthereumAddress(activeEvmAddress) ||
      status !== TxStatus.NotYetInitiated
    ) {
      return;
    }

    setStatus(TxStatus.Processing);

    // TODO: Handle errors.
    const evmWalletClient = createEvmWalletClient(activeEvmAddress);

    // TODO: Handle errors.
    const { request } = await evmPublicClient.simulateContract({
      address: getAddressOfPrecompile(precompile),
      abi: getAbiForPrecompile(precompile),
      functionName: functionName,
      args,
      account: ensureHex(activeEvmAddress),
    });

    // TODO: Handle errors/failure.
    const txHash = await evmWalletClient.writeContract(request);

    // TODO: Need proper typing for this, currently `any`.
    const tx = await evmPublicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    setStatus(tx.status === 'success' ? TxStatus.Complete : TxStatus.Error);

    // TODO: Return clean up.
  }, [activeEvmAddress, args, precompile, status, functionName]);

  return { perform, status };
}

export default useEvmPrecompileAbiCall;
