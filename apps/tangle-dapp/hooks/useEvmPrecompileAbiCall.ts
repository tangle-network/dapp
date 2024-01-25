import { isEthereumAddress } from '@polkadot/util-crypto';
import { ensureHex } from '@webb-tools/dapp-config';
import { useCallback, useState } from 'react';

import {
  createEvmWalletClient,
  evmPublicClient,
} from '../constants/evmActions';
import {
  AbiFunctionName,
  AbiPrecompileCategory,
  getPrecompileAbiFromCategory,
  getPrecompileAddressFromCategory,
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
function useEvmPrecompileAbiCall<T extends AbiPrecompileCategory>(
  category: T,
  targetFunctionName: AbiFunctionName<T>,
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

    const { request } = await evmPublicClient.simulateContract({
      address: getPrecompileAddressFromCategory(category),
      abi: getPrecompileAbiFromCategory(category),
      functionName: targetFunctionName,
      args: args,
      account: ensureHex(activeEvmAddress),
    });

    // TODO: Handle errors.
    const evmWalletClient = createEvmWalletClient(activeEvmAddress);
    const txHash = await evmWalletClient.writeContract(request);

    setStatus(TxStatus.Complete);

    // TODO: Handle txHash.
  }, [activeEvmAddress, args, category, status, targetFunctionName]);

  return { perform, status };
}

export default useEvmPrecompileAbiCall;
