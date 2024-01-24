import { isEthereumAddress } from '@polkadot/util-crypto';
import { ensureHex } from '@webb-tools/dapp-config';
import { useCallback } from 'react';

import {
  createEvmWalletClient,
  evmPublicClient,
} from '../constants/evmActions';
import {
  PrecompileAddress,
  STAKING_PRECOMPILE_ABI,
} from '../constants/evmPrecompiles';
import useEvmAddress from './useEvmAddress';

/**
 * Obtain a function that can be used to perform a precompile contract call.
 *
 * @remarks
 * Precompiles run on the chain's EVM, and are used for performing actions
 * that are not possible to perform on the Substrate chain for EVM accounts
 * (ex. those using MetaMask).
 *
 * This is used for performing actions from EVM accounts. Substrate accounts
 * should use `useTx` for transactions instead, or `usePolkadotApi` for queries.
 */
const useEvmPrecompileAbiCall = (
  address: PrecompileAddress,
  targetFunctionName: string,
  args: unknown[]
) => {
  const activeEvmAddress = useEvmAddress();

  const perform = useCallback(async () => {
    if (activeEvmAddress === null || !isEthereumAddress(activeEvmAddress)) {
      return;
    }

    // TODO: Create `getOrSetEvmPublicClientSingleton` singleton-style function.

    const { request } = await evmPublicClient.simulateContract({
      address,
      abi: STAKING_PRECOMPILE_ABI,
      functionName: targetFunctionName,
      args: args,
      account: ensureHex(activeEvmAddress),
    });

    const evmWalletClient = createEvmWalletClient(activeEvmAddress);
    const txHash = await evmWalletClient.writeContract(request);

    // TODO: Handle txHash.
  }, [activeEvmAddress, address, args, targetFunctionName]);

  return perform;
};

export default useEvmPrecompileAbiCall;
