import { ensureHex } from '@webb-tools/dapp-config';
import { AddressType } from '@webb-tools/dapp-config/types';

import {
  PrecompileAddress,
  STAKING_PRECOMPILE_ABI,
} from '../../constants/evmPrecompiles';
import { createEvmWalletClient, evmPublicClient } from './client';

export const withdrawUnbondedTokens = async (
  nominatorAddress: string,
  slashingSpans: number
): Promise<AddressType> => {
  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.STAKING,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'withdrawUnbonded',
    args: [slashingSpans],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);
  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};
