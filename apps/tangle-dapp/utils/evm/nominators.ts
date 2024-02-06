import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { ensureHex } from '@webb-tools/dapp-config';
import { AddressType } from '@webb-tools/dapp-config/types';

import {
  PrecompileAddress,
  STAKING_PRECOMPILE_ABI,
} from '../../constants/evmPrecompiles';
import { createEvmWalletClient, evmPublicClient } from './client';

export const nominateValidators = async (
  nominatorAddress: string,
  validatorAddresses: string[]
): Promise<AddressType> => {
  const targets = validatorAddresses.map((address) => {
    return u8aToHex(decodeAddress(address));
  });

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.Staking,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'nominate',
    args: [targets],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);

  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};

export const stopNomination = async (
  nominatorAddress: string
): Promise<AddressType> => {
  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.Staking,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'chill',
    args: [],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);

  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};
