import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { ensureHex } from '@webb-tools/dapp-config';
import { AddressType } from '@webb-tools/dapp-config/types';

import {
  PrecompileAddress,
  STAKING_PRECOMPILE_ABI,
} from '../../constants/evmPrecompiles';
import { createEvmWalletClient, evmPublicClient } from './client';

export const payoutStakers = async (
  nominatorAddress: string,
  validatorAddress: string,
  era: number
): Promise<AddressType> => {
  const validator = u8aToHex(decodeAddress(validatorAddress));

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.STAKING,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'payoutStakers',
    args: [validator, era],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);
  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};
