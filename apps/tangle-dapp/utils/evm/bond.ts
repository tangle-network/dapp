import { ensureHex } from '@webb-tools/dapp-config';
import { AddressType } from '@webb-tools/dapp-config/types';
import { parseEther } from 'viem';

import {
  PrecompileAddress,
  STAKING_PRECOMPILE_ABI,
} from '../../constants/evmPrecompiles';
import { createEvmWalletClient, evmPublicClient } from './client';

export const bondExtraTokens = async (
  nominatorAddress: string,
  numberOfTokens: number
): Promise<AddressType> => {
  const value = parseEther(numberOfTokens.toString());

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.STAKING,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'bondExtra',
    args: [value],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);
  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};

export const unBondTokens = async (
  nominatorAddress: string,
  numberOfTokens: number
): Promise<AddressType> => {
  const value = parseEther(numberOfTokens.toString());

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.STAKING,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'unbond',
    args: [value],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);
  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};

export const rebondTokens = async (
  nominatorAddress: string,
  numberOfTokens: number
): Promise<AddressType> => {
  const value = parseEther(numberOfTokens.toString());

  const { request } = await evmPublicClient.simulateContract({
    address: PrecompileAddress.STAKING,
    abi: STAKING_PRECOMPILE_ABI,
    functionName: 'rebond',
    args: [value],
    account: ensureHex(nominatorAddress),
  });

  const evmWalletClient = createEvmWalletClient(nominatorAddress);
  const txHash = await evmWalletClient.writeContract(request);

  return txHash;
};

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
